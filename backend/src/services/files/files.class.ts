import { PersistentFile } from 'formidable'
import { join, basename } from 'path'
import { rename, readFile, unlink } from 'fs/promises'
import type { Id, Params } from '@feathersjs/feathers'
import { NeDBService } from '../../utils/NeDBService'

import type { Application } from '../../declarations'
import type { File, FileData, FilePatch, FileQuery } from './files.schema'

export type { File, FileData, FilePatch, FileQuery }

export interface FileServiceOptions {
  app: Application
  uploadDir: string
}

export interface FileParams extends Params<FileQuery> {}

export class FileService<ServiceParams extends FileParams = FileParams>
  extends NeDBService<File, FileData, ServiceParams, FilePatch>
{
  constructor(public options: FileServiceOptions) {
    super({
      ...options,
      dbname: 'files',
      indexes: [
        { fieldName: 'path' },
        { fieldName: ['path', 'name'], unique: true },
      ],
    })
  }

  async get(id: Id, _params?: ServiceParams): Promise<File> {
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
    const { upload, path } = data

    if (!(upload instanceof PersistentFile)) {
      throw new Error('upload should be a file')
    }

    const { filepath, originalFilename, size, mimetype } = upload
    
    const fileId = basename(filepath)
    await rename(filepath, this.idToPath(fileId)) 
    const _updatedAt = now()

    if (_existing?.fileId) {
      await unlink(this.idToPath(_existing.fileId))
    }

    return {
      path,
      name: originalFilename,
      fileId,
      size,
      mimetype,
      _createdAt: _existing?._createdAt ?? _updatedAt,
      _updatedAt,
    } as File
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
