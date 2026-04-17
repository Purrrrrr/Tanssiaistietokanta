import { hooks as schemaHooks } from '@feathersjs/schema'
import { omit } from 'ramda'

import {
  documentDataValidator,
  documentPatchValidator,
  documentQueryValidator,
  documentDataResolver,
  documentPatchResolver,
  documentQueryResolver,
} from './documents.schema'

import type { Application } from '../../declarations'
import { DocumentsService, getOptions } from './documents.class'
import { documentsPath, documentsMethods } from './documents.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { SkipAccessControl } from '../access/hooks'

export * from './documents.class'
export * from './documents.schema'

export const documents = (app: Application) => {
  app.use(documentsPath, new DocumentsService(getOptions(app)), {
    methods: documentsMethods,
    events: [],
  })

  app.service(documentsPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [
        mergeJsonPatch(omit(['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt', 'root']) as (data: unknown) => unknown),
        schemaHooks.validateQuery(documentQueryValidator),
        schemaHooks.resolveQuery(documentQueryResolver),
      ],
      find: [],
      get: [],
      create: [schemaHooks.validateData(documentDataValidator), schemaHooks.resolveData(documentDataResolver)],
      patch: [schemaHooks.validateData(documentPatchValidator), schemaHooks.resolveData(documentPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })

  const documentService = app.service(documentsPath)
  const accessService = app.service('access')

  accessService.setAccessStrategy('documents', {
    getOwnerFromData(document) {
      return {
        owner: document.owner,
        owningId: document.owningId,
      }
    },
    getEntityOwner: async (entityId) => {
      return await documentService.get(entityId, {
        [SkipAccessControl]: true,
        query: { $select: ['owner', 'owningId'] },
      })
    },
    authTarget: 'owner',
    authorize({ action, user, owner, owningId }) {
      if (action === 'list') {
        return true
      }
      if (!owner) {
        return undefined
      }
      return accessService.hasAccess(owner, action, user, owningId)
    },
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [documentsPath]: SupportsJsonPatch<DocumentsService>
  }
}
