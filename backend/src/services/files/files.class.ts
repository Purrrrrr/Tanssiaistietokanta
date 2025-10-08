// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import { PersistentFile } from 'formidable'
import { join, basename } from 'path'
import { rename, readFile } from 'fs/promises'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { File, FileData, FilePatch, FileQuery } from './files.schema'
import { map } from '../../utils/map'

export type { File, FileData, FilePatch, FileQuery }

export interface FileServiceOptions {
  app: Application
  uploadDir: string
}

export interface FileParams extends Params<FileQuery> {}

interface InternalFileData extends Pick<File, 'name' | 'mimetype'> {
  storedName: string
}

export class FileService<ServiceParams extends FileParams = FileParams>
  implements ServiceInterface<File, FileData, ServiceParams, FilePatch>
{
  uploadDir: string
  db: VersioningNeDBService<File & InternalFileData, InternalFileData, ServiceParams, FilePatch>

  constructor(public options: FileServiceOptions) {

    this.db = new VersioningNeDBService({ ...options, dbname: 'files'})
    this.uploadDir = options.uploadDir
  }

  async find(_params?: ServiceParams): Promise<File[]> {
    return (await this.db.find(_params)).map(omitInternalFields)
  }

  async get(id: Id, _params?: ServiceParams): Promise<File> {
    const download = _params?.query?.download
    const file = await this.db.get(id)
    const result = omitInternalFields(file)
    
    if (download) {
      const filePath = join(this.uploadDir, file.storedName)
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
    const { upload } = data

    if (!(upload instanceof PersistentFile)) {
      throw new Error('upload should be a file')
    }
    
    const storedName = basename(upload.filepath)
    await rename(upload.filepath, join(this.uploadDir, storedName)) 

    return omitInternalFields(
      await this.db.create({
        name: upload.originalFilename,
        storedName,
        mimetype: upload.mimetype,
      }, params)
    )
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
    return map(await this.db.remove(id, _params), omitInternalFields)
  }
}

function omitInternalFields({ storedName, ...file }: InternalFileData & File): File {
  return file
}

export const getOptions = (app: Application) => {
  return { 
    app,
    uploadDir: app.get('uploadDir'),
  }
}
