// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import * as L from 'partial.lenses'
import * as R from 'ramda'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { compose, omit } from 'ramda'

import {
  eventsDataValidator,
  eventsPatchValidator,
  eventsQueryValidator,
  eventsResolver,
  eventsExternalResolver,
  eventsDataResolver,
  eventsPatchResolver,
  eventsQueryResolver,
  eventAccessDataSchema,
  EventAccessData,
} from './events.schema'

import type { Application } from '../../declarations'
import { EventsService, getOptions } from './events.class'
import { eventsPath, eventsMethods } from './events.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { AccessStrategy, AuthParams } from '../access/strategies'

export * from './events.class'
export * from './events.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const events = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventsPath, new EventsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })

  // Initialize hooks
  app.service(eventsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(eventsExternalResolver), schemaHooks.resolveResult(eventsResolver)],
    },
    before: {
      all: [
        mergeJsonPatch(
          compose(
            omit(['_id', '_versionId', '_createdAt', '_updatedAt']) as (data: unknown) => unknown,
            L.remove(['program', 'introductions', 'program', L.elems, 'dance']),
            L.remove(['program', 'danceSets', L.elems, 'program', L.elems, 'dance']),
            L.remove(['program', 'danceSets', L.elems, 'intervalMusic', L.when(R.isNotNil), 'dance']),
          ),
        ),
        schemaHooks.validateQuery(eventsQueryValidator), schemaHooks.resolveQuery(eventsQueryResolver),
      ],
      find: [],
      get: [],
      create: [schemaHooks.validateData(eventsDataValidator), schemaHooks.resolveData(eventsDataResolver)],
      patch: [schemaHooks.validateData(eventsPatchValidator), schemaHooks.resolveData(eventsPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })

  const allowUser = (userId: string) => `user:${userId}`

  class EventAccessStrategy implements AccessStrategy<EventAccessData> {
    store = app.service('access').getStore('events', eventAccessDataSchema, {
      viewers: ['everyone'],
    })

    async authorize({ type, action, entityData, user }: AuthParams<EventAccessData>) {
      if (type === 'global') {
        return undefined
      }
      const { viewers } = entityData
      const canRead = this.hasAccess(viewers, user?._id)
      if (action !== 'read') {
        return !!user && canRead
      }
      return canRead
    }

    hasAccess(userList: string[], userId: string | undefined) {
      if (userList.includes('everyone')) {
        return true
      }
      if (userList.includes('logged-in') && userId) {
        return true
      }
      if (userId && userList.includes(allowUser(userId))) {
        return true
      }
      return false
    }
  }

  app.service('access').setAccessStrategy('events', new EventAccessStrategy())
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventsPath]: SupportsJsonPatch<EventsService>
  }
}
