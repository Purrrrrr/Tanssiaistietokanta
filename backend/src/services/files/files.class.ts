// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import { PersistentFile } from 'formidable'
import { join, basename } from 'path'
import { rename, readFile } from 'fs/promises'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import { NeDBService } from '../../utils/NeDBService'

import type { Application } from '../../declarations'
import type { File, FileData, FilePatch, FileQuery } from './files.schema'

export type { File, FileData, FilePatch, FileQuery }

export interface FileServiceOptions {
  app: Application
  uploadDir: string
}

export interface FileParams extends Params<FileQuery> {}

interface InternalFileData extends Omit<File, '_id' | 'buffer'> {}

export class FileService<ServiceParams extends FileParams = FileParams>
  implements ServiceInterface<File, FileData, ServiceParams, FilePatch>
{
  uploadDir: string
  db: NeDBService<File, InternalFileData, ServiceParams, FilePatch>

  constructor(public options: FileServiceOptions) {

    this.db = new NeDBService({
      ...options,
      dbname: 'files',
      indexes: [
        { fieldName: 'path' },
        { fieldName: ['path', 'name'], unique: true },
      ],
    })
    this.uploadDir = options.uploadDir
  }

  async find(_params?: ServiceParams): Promise<File[]> {
    return this.db.find(_params)
  }

  async get(id: Id, _params?: ServiceParams): Promise<File> {
    const download = _params?.query?.download
    const result = await this.db.get(id)
    
    if (download) {
      const filePath = join(this.uploadDir, result.fileId)
      const buffer = await readFile(filePath) as any
      result.buffer = buffer
    }

    return result
  }

  async create(data: FileData, params?: ServiceParams): Promise<File>
  async create(data: FileData[], params?: ServiceParams): Promise<File[]>
  async create(data: FileData | FileData[], params?: ServiceParams): Promise<File | File[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }
    const { upload, path } = data

    if (!(upload instanceof PersistentFile)) {
      throw new Error('upload should be a file')
    }

    const { filepath, originalFilename, size, mimetype } = upload
    
    const fileId = basename(filepath)
    await rename(filepath, join(this.uploadDir, fileId)) 

    return await this.db.create({
      path,
      name: originalFilename,
      fileId,
      size,
      mimetype,
      _createdAt: now(),
      _updatedAt: now(),
    }, params)

  }

  // This method has to be added to the 'methods' option to make it available to clients
  // async update(id: NullableId, data: FileData, _params?: ServiceParams): Promise<File> {
  //   return this.db.update(id, data, _params)
  // }
  //
  // async patch(id: NullableId, data: FilePatch, _params?: ServiceParams): Promise<File> {
  //   return this.db.patch(id, data, _params)
  // }
  //
  async remove(id: NullableId, _params?: ServiceParams): Promise<File | File[]> {
    return this.db.remove(id, _params)
  }

}

export const getOptions = (app: Application) => {
  return { 
    app,
    uploadDir: app.get('uploadDir'),
  }
}

const now = () => new Date().toISOString()
