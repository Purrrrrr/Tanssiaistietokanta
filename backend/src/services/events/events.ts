// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { hooks as schemaHooks } from '@feathersjs/schema'
import { omit } from 'ramda'

import {
  eventsDataValidator,
  eventsPatchValidator,
  eventsQueryValidator,
  eventsResolver,
  eventsExternalResolver,
  eventsDataResolver,
  eventsPatchResolver,
  eventsQueryResolver
} from './events.schema'

import type { Application } from '../../declarations'
import { EventsService, getOptions } from './events.class'
import { eventsPath, eventsMethods } from './events.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { AllowAllStrategy, AllowLoggedInStrategy, entityFieldBasedListingQuery } from '../access/strategies'

export * from './events.class'
export * from './events.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const events = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventsPath, new EventsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  // Initialize hooks
  app.service(eventsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(eventsExternalResolver), schemaHooks.resolveResult(eventsResolver)],
    },
    before: {
      all: [mergeJsonPatch(omit(['_id', '_createdAt', '_updatedAt']) as (data: unknown) => unknown), schemaHooks.validateQuery(eventsQueryValidator), schemaHooks.resolveQuery(eventsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(eventsDataValidator), schemaHooks.resolveData(eventsDataResolver)],
      patch: [schemaHooks.validateData(eventsPatchValidator), schemaHooks.resolveData(eventsPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })

  app.service('access').addAccessStrategy({
    service: 'events',
    actions: {
      read: AllowAllStrategy,
      create: AllowLoggedInStrategy,
      modify: AllowLoggedInStrategy,
    },
    getFindQuery: entityFieldBasedListingQuery<'events'>('allowedViewers'),
    authenticate: {
      find: ({ canDo }) => canDo('read'),
      get: ({ canDo }) => canDo('read'),
      create: ({ canDo }) => canDo('create'),
      default: ({ canDo }) => canDo('modify'),
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventsPath]: SupportsJsonPatch<EventsService>
  }
}
