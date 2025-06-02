// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  convertDataValidator,
  convertQueryValidator,
} from './convert.schema'

import type { Application } from '../../declarations'
import { ConvertService, getOptions } from './convert.class'
import { convertPath, convertMethods } from './convert.shared'

export * from './convert.class'
export * from './convert.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const convert = (app: Application) => {
  // Register our service on the Feathers application
  app.use(convertPath, new ConvertService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: convertMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(convertPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [schemaHooks.validateQuery(convertQueryValidator)],
      create: [schemaHooks.validateData(convertDataValidator)],
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
    [convertPath]: ConvertService
  }
}
