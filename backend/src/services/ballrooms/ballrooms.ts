import { hooks as schemaHooks } from '@feathersjs/schema'
import { omit } from 'ramda'

import {
  ballroomsDataValidator,
  ballroomsPatchValidator,
  ballroomsQueryValidator,
  ballroomsResolver,
  ballroomsExternalResolver,
  ballroomsDataResolver,
  ballroomsPatchResolver,
  ballroomsQueryResolver,
} from './ballrooms.schema'

import type { Application } from '../../declarations'
import { BallroomsService, getOptions } from './ballrooms.class'
import { ballroomsPath, ballroomsMethods } from './ballrooms.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { defaultChannels } from '../../utils/defaultChannels'

export * from './ballrooms.class'
export * from './ballrooms.schema'

export const ballrooms = (app: Application) => {
  app.use(ballroomsPath, new BallroomsService(getOptions(app)), {
    methods: ballroomsMethods,
    events: [],
  })

  app.service(ballroomsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(ballroomsExternalResolver), schemaHooks.resolveResult(ballroomsResolver)],
    },
    before: {
      all: [
        mergeJsonPatch(omit(['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt']) as (data: unknown) => unknown),
        schemaHooks.validateQuery(ballroomsQueryValidator),
        schemaHooks.resolveQuery(ballroomsQueryResolver),
      ],
      find: [],
      get: [],
      create: [schemaHooks.validateData(ballroomsDataValidator), schemaHooks.resolveData(ballroomsDataResolver)],
      patch: [schemaHooks.validateData(ballroomsPatchValidator), schemaHooks.resolveData(ballroomsPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  app.service('access').setAccessStrategy('ballrooms', {
    authTarget: 'everything',
    authorize({ user, action }) {
      if (action === 'read' || action === 'list') {
        return true
      }

      return !!user
    },
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [ballroomsPath]: SupportsJsonPatch<BallroomsService>
  }
}
