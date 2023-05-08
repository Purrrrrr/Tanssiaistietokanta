// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations'
import { GraphqlService, getOptions } from './graphql.class'
import { graphqlPath, graphqlMethods } from './graphql.shared'

export * from './graphql.class'

// A configure function that registers the service and its hooks via `app.configure`
export const graphql = (app: Application) => {
  // Register our service on the Feathers application
  app.use(graphqlPath, new GraphqlService(getOptions(app, '/graphql')), {
    // A list of all methods this service exposes externally
    methods: graphqlMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(graphqlPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [],
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
    [graphqlPath]: GraphqlService
  }
}
