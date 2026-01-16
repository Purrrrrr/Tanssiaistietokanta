import { PersistentFile } from 'formidable'
import archiver  from 'archiver'
import { join, dirname, basename, parse } from 'path'
import { rename, readdir, readFile, stat, unlink, mkdir } from 'fs/promises'
import type { Id, Params } from '@feathersjs/feathers'
import cron from 'node-cron'

import { NeDBService } from '../../utils/NeDBService'
import type { Application } from '../../declarations'
import { ErrorWithStatus } from '../../hooks/addErrorStatusCode'
import type { File, FileData, FilePatch, FileQuery } from './files.schema'
import { ClamScanner } from './clamscanner'
import { sum, takeWhile } from 'es-toolkit'
import { PassThrough, Stream } from 'stream'
import { logger, withRequestLogging } from '../../requestLogger'

export type { File, FileData, FilePatch, FileQuery }

export interface FileServiceOptions {
  app: Application
  uploadDir: string
  uploadTmp: string
}

export interface FileParams extends Params<FileQuery> {}

const MB = 1024**2
const RootSizeCleanUpTreshold = 5 * MB
const DAY = 24 * 60 * 60 * 1000;
const MaxTmpFileAge = 3 * DAY
const MaxZipSize = 50 * MB
export const MaxFileSize = 30 * MB

export class FileService
  extends NeDBService<File, FileData, FileParams, FilePatch>
{
  scanner: ClamScanner

  constructor(public options: FileServiceOptions) {
    super({
      ...options,
      dbname: 'files',
      indexes: [
        { fieldName: ['root', 'path'] },
        { fieldName: ['root', 'path', 'name'], unique: true },
      ],
    })
    this.scanner = new ClamScanner(options.app)
    cron.schedule('0 0 * * *', () => Promise.all([
      this.cleanUpUnused(), this.cleanUpTmp(),
    ]))
  }

  async setup(): Promise<void> {
    return this.scanner.init()
  }

  cleanUpUnused = withRequestLogging('files', 'cleanUpUnused', async () => {
    const allFiles = await this.find({ query: { unused: true, $sort: { _updatedAt: 1 /* ASC */ } }})
    const byRoot = Map.groupBy(allFiles, file => file.root)

    for (const [root, files] of byRoot.entries()) {
      const size = sum(files.map(file => file.size))

      if (size > RootSizeCleanUpTreshold) {
        let sizeLeft = size
        const picked = takeWhile(files, file => {
          if (sizeLeft <= 0) return false
          sizeLeft -= file.size
          return true
        })
        logger.info(`Cleaning up ${picked.length} unused files from root ${root}`)
        await Promise.all(picked.map(file => this.remove(file._id)))
        logger.info(`Unused files for root ${root} cleaned up`)
      } else {
        logger.info(`No need to clean up unused files for root ${root} (size ${(size/1024).toFixed(2)}kb)`)
      }
    }
  })

  cleanUpTmp = withRequestLogging('files', 'cleanUpTmp', async () => {
    const tmpDir = this.options.uploadTmp
    const now = Date.now();
    const files = await readdir(tmpDir);
    if (files.length === 0) {
      logger.info(`No files in tmp dir ${tmpDir}`)
      return
    }
    logger.info(`Checking ${files.length} files in tmp dir ${tmpDir}`)

    const filesToUnlink = []
    for (const file of files) {
      const filePath = join(tmpDir, file);
      const fileStat = await stat(filePath);

      // Skip directories
      if (!fileStat.isFile()) continue;

      const age = now - fileStat.mtimeMs;
      if (age > MaxTmpFileAge) {
        filesToUnlink.push(filePath);
      }
    }
    if (filesToUnlink.length > 0) {
      logger.info(`Removing ${filesToUnlink.length} files from tmp dir ${tmpDir}`)
      await Promise.all(filesToUnlink.map(unlink));
      logger.info(`Files removed`)
    }
  })

  async find(_params?: FileParams): Promise<File[]> {
    const download = _params?.query?.download
    if (download) {
      delete _params.query?.download
    }
    const result = await super.find(_params)

    if (download) {
      switch (result.length) {
        case 0:
          throw new ErrorWithStatus(404, 'Files not found')
        case 1:
        {
          const filePath = this.idToPath(result[0])
          result[0].buffer = await readFile(filePath)
          break
        }
        default:
        {
          const size = sum(result.map(file => file.size))
          if (size > MaxZipSize) {
            throw new ErrorWithStatus(422, `Combined file size ${size/1024} kb exceeds the limit of ${MaxZipSize/1024} kb`)
          }
          const archiveProgress = Promise.withResolvers()
          const stream = new PassThrough()
          const archive = archiver('zip', { zlib: { level: 9 }})
          archive.on('error', e => archiveProgress.reject(e))
          archive.on('finish', () => archiveProgress.resolve(true))
          archive.pipe(stream)

          for (const file of result) {
            archive.file(this.idToPath(file), { name: file.name })
          }

          archive.finalize()

          await archiveProgress.promise
          result[0].buffer = stream
          result[0].name = 'download.zip'
          result[0].mimetype = 'application/zip'
        }
      }
    }

    return result
  }

  async get(id: Id, _params?: FileParams): Promise<File> {
    const download = _params?.query?.download
    const result = await super.get(id)

    if (download) {
      const filePath = this.idToPath(result)
      result.buffer = await readFile(filePath)
    }

    return result
  }

  protected async mapData(_existing: File | null, data: FileData): Promise<File> {
    const { upload, path, owner, owningId, autoRename, unused = false, notes = '' } = data
    if (!(upload instanceof PersistentFile)) {
      throw new Error('upload should be a file')
    }
    const root = `${owner}/${owningId}`
    const { filepath, originalFilename, size, mimetype } = upload

    const name = await this.handleNameDuplicates({ root, path, name: data.filename ?? originalFilename, autoRename }, _existing)
    const infected = await this.scanner.isInfected(filepath)

    if (infected) {
      throw new ErrorWithStatus(422, {
        code: 'FILE_IS_INFECTED',
        message: 'Infected file',
      })
    }

    const fileId = basename(filepath)
    const fileStoragePath = this.idToPath({ fileId, owner, owningId })
    await mkdir(dirname(fileStoragePath), { recursive: true })
    await rename(filepath, fileStoragePath)
    const _updatedAt = now()

    if (_existing?.fileId) {
      await unlink(this.idToPath({ fileId: _existing.fileId, owner, owningId }))
    }

    return {
      owner,
      owningId,
      root,
      path,
      name,
      fileId,
      size,
      notes,
      mimetype,
      unused,
      _createdAt: _existing?._createdAt ?? _updatedAt,
      _updatedAt,
    } satisfies Omit<File, '_id'> as File
  }

  protected async mapPatch(existing: File, data: FilePatch) {
    const patched = { ...existing, ...data, _updatedAt: now() }
    patched.name = await this.handleNameDuplicates(
      patched,
      existing
    )
    return patched
  }


  private async handleNameDuplicates(
    { autoRename, ...filePath }: Pick<File, 'root' | 'path' | 'name'> & Pick<FileData, 'autoRename'>,
    existingFile: File | null
  ) {
    let hasDuplicates = await this.hasDuplicateName(filePath, existingFile)
    if (hasDuplicates) {
      if (!autoRename) {
        throw new ErrorWithStatus(409, {
          code: 'FILE_EXISTS',
          message: 'The file already exists',
        })
      }

      const { name, ext } = parse(filePath.name)
      let counter = 2
      let proposedName: string
      do {
        proposedName = ext ? `${name} (${counter})${ext}` : `${name} (${counter})`
        hasDuplicates = await this.hasDuplicateName({ ...filePath, name: proposedName }, existingFile)
        counter += 1
      } while (hasDuplicates)
      return proposedName
    }

    return filePath.name
  }

  private async hasDuplicateName({ root, path, name }: Pick<File, 'root' | 'path' | 'name'>, existingFile: File | null) {
    const duplicates = await this.find({ query: { root, path, name } })
    return duplicates.length > 0 && (!existingFile || duplicates.some(file => file._id !== existingFile._id))
  }

  protected onRemove(result: File): void | Promise<void> {
    const path = this.idToPath(result)
    return unlink(path)
  }

  private idToPath({ owner, owningId, fileId }: Pick<File, 'fileId' | 'owner' | 'owningId'>) {
    return join(this.options.uploadDir, owner, owningId, fileId)
  }
}

export const getOptions = (app: Application) => {
  return {
    app,
    uploadDir: app.get('uploadDir'),
    uploadTmp: app.get('uploadTmp'),
  }
}

const now = () => new Date().toISOString()
