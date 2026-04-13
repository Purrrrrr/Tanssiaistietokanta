import type { Params } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { Document, DocumentData, DocumentPatch, DocumentQuery } from './documents.schema'

export type { Document, DocumentData, DocumentPatch, DocumentQuery }

export interface DocumentsServiceOptions {
  app: Application
}

export interface DocumentsParams extends Params<DocumentQuery> {}

export class DocumentsService<ServiceParams extends DocumentsParams = DocumentsParams>
  extends VersioningNeDBService<Document, DocumentData, ServiceParams, DocumentPatch> {
  constructor(public options: DocumentsServiceOptions) {
    super({
      ...options,
      dbname: 'documents',
      indexes: [
        { fieldName: ['root', 'path'] },
      ],
    })
  }

  protected async mapData(existing: Document | null, data: DocumentData): Promise<Document> {
    const { owner, owningId, path = '', title, content = null } = data
    const root = `${owner}/${owningId}`
    const base = await super.mapData(existing, data as any)
    return {
      ...base,
      owner,
      owningId,
      root,
      path,
      title,
      content,
    }
  }

  protected async mapPatch(existing: Document, data: DocumentPatch): Promise<Document> {
    const base = await super.mapPatch(existing, data as any)
    return {
      ...base,
      ...(data.owner !== undefined || data.owningId !== undefined
        ? { root: `${data.owner ?? existing.owner}/${data.owningId ?? existing.owningId}` }
        : {}),
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
