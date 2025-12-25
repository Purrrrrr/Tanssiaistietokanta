// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  sessionDataValidator,
  sessionPatchValidator,
  sessionQueryValidator,
  sessionResolver,
  sessionExternalResolver,
  sessionDataResolver,
  sessionPatchResolver,
  sessionQueryResolver
} from './sessions.schema'

import type { Application } from '../../declarations'
import { SessionsService, getOptions } from './sessions.class'
import { sessionsPath, sessionsMethods } from './sessions.shared'
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common'

export * from './sessions.class'
export * from './sessions.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const sessions = (app: Application) => {
  // Register our service on the Feathers application
  app.use(sessionsPath, new SessionsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sessionsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sessionsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(sessionExternalResolver),
        schemaHooks.resolveResult(sessionResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(sessionQueryValidator),
        schemaHooks.resolveQuery(sessionQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        disallow('external'),
        schemaHooks.validateData(sessionDataValidator),
        schemaHooks.resolveData(sessionDataResolver)
      ],
      update: [
        disallow('external'),
        schemaHooks.validateData(sessionDataValidator),
        schemaHooks.resolveData(sessionDataResolver)
      ],
      patch: [
        disallow('external'),
        schemaHooks.validateData(sessionPatchValidator),
        schemaHooks.resolveData(sessionPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [iff(isProvider('external'), discard('token'))]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [sessionsPath]: SessionsService
  }
}
