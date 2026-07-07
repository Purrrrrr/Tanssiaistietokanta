// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations'
import { DiagramService, getOptions } from './diagrams.class'
import { diagramPath, diagramMethods } from './diagrams.shared'

export * from './diagrams.class'

// A configure function that registers the service and its hooks via `app.configure`
export const diagram = (app: Application) => {
  // Register our service on the Feathers application
  app.use(diagramPath, new DiagramService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: diagramMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(diagramPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [],
      get: [],
      create: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [diagramPath]: DiagramService
  }
}
