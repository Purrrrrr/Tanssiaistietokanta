// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  channelConnectionsDataValidator,
  channelConnectionsQueryValidator,
  channelConnectionsQueryResolver,
} from './channel-connections.schema'

import type { Application } from '../../declarations'
import { ChannelConnectionsService, getOptions } from './channel-connections.class'
import { channelConnectionsPath, channelConnectionsMethods } from './channel-connections.shared'

export * from './channel-connections.class'
export * from './channel-connections.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const channelConnections = (app: Application) => {
  // Register our service on the Feathers application
  app.use(channelConnectionsPath, new ChannelConnectionsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: channelConnectionsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(channelConnectionsPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [
        schemaHooks.validateQuery(channelConnectionsQueryValidator),
        schemaHooks.resolveQuery(channelConnectionsQueryResolver),
      ],
      find: [

      ],
      create: [
        schemaHooks.validateData(channelConnectionsDataValidator),
      ],
      remove: [],
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
    [channelConnectionsPath]: ChannelConnectionsService
  }
}
