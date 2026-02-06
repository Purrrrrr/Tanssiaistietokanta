import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  accessQueryValidator,
  accessResolver,
  accessExternalResolver,
  accessQueryResolver,
} from './access.schema'

import type { Application, HookContext } from '../../declarations'
import { AccessService, getOptions } from './access.class'
import { accessPath, accessMethods } from './access.shared'
import { FeathersService } from '@feathersjs/feathers'
import { Publisher } from '@feathersjs/transport-commons/lib/channels/mixins'

export * from './access.class'
export * from './access.schema'

export const channelAccessControl = (app: Application) => {
  function wrapPublish(originalPublish: Publisher) {
    return async function<T>(this: FeathersService, data: T, context: HookContext) {
      const channels = await originalPublish.call(this, data, context)
      if (!channels) {
        return channels
      }

      return app.service('access').handlePublish(data, channels, context)
    }
  }

  app.mixins.push(function (service: FeathersService) {
    const publish = service.publish

    service.publish = function (this: FeathersService, event, publisher) {
      if (typeof event === 'function') {
        return publish.call(this, wrapPublish(event) as any, undefined as any)
      }
      return publish.call(this, event, wrapPublish(publisher) as any)
    } as typeof service.publish
  })
}

// A configure function that registers the service and its hooks via `app.configure`
export const access = (app: Application) => {
  // Register our service on the Feathers application
  app.use(accessPath, new AccessService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: accessMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(accessPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(accessExternalResolver), schemaHooks.resolveResult(accessResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(accessQueryValidator), schemaHooks.resolveQuery(accessQueryResolver)],
      find: [],
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
    [accessPath]: AccessService
  }
}
