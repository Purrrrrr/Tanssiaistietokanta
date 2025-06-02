// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  dancewikiDataValidator,
  dancewikiQueryValidator,
  dancewikiResolver,
  dancewikiExternalResolver,
  dancewikiDataResolver,
  dancewikiQueryResolver
} from './dancewiki.schema'

import type { Application } from '../../declarations'
import { DancewikiService, getOptions } from './dancewiki.class'
import { dancewikiPath, dancewikiMethods } from './dancewiki.shared'

export * from './dancewiki.class'
export * from './dancewiki.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const dancewiki = (app: Application) => {
  // Register our service on the Feathers application
  app.use(dancewikiPath, new DancewikiService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: dancewikiMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(dancewikiPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(dancewikiExternalResolver),
        schemaHooks.resolveResult(dancewikiResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(dancewikiQueryValidator),
        schemaHooks.resolveQuery(dancewikiQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(dancewikiDataValidator),
        schemaHooks.resolveData(dancewikiDataResolver)
      ],
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [dancewikiPath]: DancewikiService
  }
}
