// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { File, FileData, FilePatch, FileQuery, FileService } from './files.class'

export type { File, FileData, FilePatch, FileQuery }

export type FileClientService = Pick<FileService<Params<FileQuery>>, (typeof fileMethods)[number]>

export const filePath = 'files'

export const fileMethods: Array<keyof FileService> = ['find', 'get', 'create', 'update', 'patch', 'remove' ]

export const fileClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(filePath, connection.service(filePath), {
    methods: fileMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [filePath]: FileClientService
  }
}
