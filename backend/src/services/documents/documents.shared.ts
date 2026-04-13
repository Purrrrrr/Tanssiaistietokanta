import type { ClientApplication } from '../../client'
import type { Document, DocumentData, DocumentPatch, DocumentQuery, DocumentsService } from './documents.class'

export type { Document, DocumentData, DocumentPatch, DocumentQuery }

export type DocumentsClientService = Pick<DocumentsService, (typeof documentsMethods)[number]>

export const documentsPath = 'documents'

export const documentsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const documentsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(documentsPath, connection.service(documentsPath), {
    methods: documentsMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [documentsPath]: DocumentsClientService
  }
}
