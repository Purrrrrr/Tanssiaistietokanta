// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  formationDiagramDataValidator,
  formationDiagramPatchValidator,
  formationDiagramQueryValidator,
  formationDiagramResolver,
  formationDiagramExternalResolver,
  formationDiagramDataResolver,
  formationDiagramPatchResolver,
  formationDiagramQueryResolver,
} from './formationDiagrams.schema'

import type { Application } from '../../declarations'
import { FormationDiagramService, getOptions } from './formationDiagrams.class'
import { formationDiagramPath, formationDiagramMethods } from './formationDiagrams.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { omit } from 'ramda'
import { getDependenciesFor } from '../../internal-services/dependencies'
import { defaultChannels, withoutCurrentConnection } from '../../utils/defaultChannels'

export * from './formationDiagrams.class'
export * from './formationDiagrams.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const formationDiagram = (app: Application) => {
  // Register our service on the Feathers application
  app.use(formationDiagramPath, new FormationDiagramService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: formationDiagramMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(formationDiagramPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(formationDiagramExternalResolver),
        schemaHooks.resolveResult(formationDiagramResolver),
      ],
    },
    before: {
      all: [
        mergeJsonPatch(omit(['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt']) as (data: unknown) => unknown),
        schemaHooks.validateQuery(formationDiagramQueryValidator),
        schemaHooks.resolveQuery(formationDiagramQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(formationDiagramDataValidator),
        schemaHooks.resolveData(formationDiagramDataResolver),
      ],
      patch: [
        schemaHooks.validateData(formationDiagramPatchValidator),
        schemaHooks.resolveData(formationDiagramPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  }).publish((data, context) => {
    const danceIds = getDependenciesFor('formationDiagrams', data, 'usedBy', 'dances')
    const ballroomIds = getDependenciesFor('formationDiagrams', data, 'uses', 'ballrooms')

    const channels = [
      ...danceIds.map(id => app.channel(`dances/${id}/formationDiagrams`)),
      ...ballroomIds.map(id => app.channel(`ballrooms/${id}/formationDiagrams`)),
    ]

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(app, context),
    ]
  })

  app.service('access').setAccessStrategy('formationDiagrams', {
    authTarget: 'everything',
    authorize({ user, action }) {
      if (action === 'read' || action === 'list') {
        return true
      }

      return !!user
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [formationDiagramPath]: SupportsJsonPatch<FormationDiagramService>
  }
}
