import { PersistentFile } from 'formidable'
import { join, basename, parse } from 'path'
import { rename, readFile, unlink } from 'fs/promises'
import type { Id, Params } from '@feathersjs/feathers'
import { NeDBService } from '../../utils/NeDBService'

import type { Application } from '../../declarations'
import type { File, FileData, FilePatch, FileQuery } from './files.schema'
import { ClamScanner } from './clamscanner'
import { ErrorWithStatus } from '../../hooks/addErrorStatusCode'

export type { File, FileData, FilePatch, FileQuery }

export interface FileServiceOptions {
  app: Application
  uploadDir: string
}

export interface FileParams extends Params<FileQuery> {}

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
  }

  async get(id: Id, _params?: FileParams): Promise<File> {
    const download = _params?.query?.download
    const result = await super.get(id)
    
    if (download) {
      const filePath = this.idToPath(result.fileId)
      const buffer = await readFile(filePath) as any
      result.buffer = buffer
    }

    return result
  }

  protected async mapData(_existing: File | null, data: FileData): Promise<File> {
    const { upload, path, root, autoRename, unused = false } = data
    if (!(upload instanceof PersistentFile)) {
      throw new Error('upload should be a file')
    }
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
    await rename(filepath, this.idToPath(fileId)) 
    const _updatedAt = now()

    if (_existing?.fileId) {
      await unlink(this.idToPath(_existing.fileId))
    }

    return {
      root,
      path,
      name,
      fileId,
      size,
      mimetype,
      unused,
      _createdAt: _existing?._createdAt ?? _updatedAt,
      _updatedAt,
    } as File
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
    const path = this.idToPath(result.fileId)
    return unlink(path)
  }

  private idToPath(fileId: string) {
    return join(this.options.uploadDir, fileId)
  }
}

export const getOptions = (app: Application) => {
  return { 
    app,
    uploadDir: app.get('uploadDir'),
  }
}

const now = () => new Date().toISOString()
