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
  eventsQueryResolver,
  eventsSchema,
  eventAccessDataSchema
} from './events.schema'

import type { Application } from '../../declarations'
import { EventsService, getOptions } from './events.class'
import { eventsPath, eventsMethods } from './events.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { defaultChannels } from '../../utils/defaultChannels'
import { Static } from '@feathersjs/typebox'
import { AccessStrategy, Action, Id } from '../access/strategies'
import { User } from '../users/users.class'

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
  }).publish((data, context) => {
    return defaultChannels(app, context)
    // if (Array.isArray(data)) {
    //   logger.error('Publishing arrays of events is not supported')
    // }
    // return defaultChannels(app, context).flatMap(channel => {
    //   //TODO turn into reusable function
    //   if (data.allowedViewers.includes('everyone')) {
    //     return [channel]
    //   }
    //   if (data.allowedViewers.includes('logged-in')) {
    //     logger.info('users', { users: channel.connections.map(connection => !!connection.user) })
    //     return [
    //       channel.filter(connection => connection.user !== undefined),
    //       channel.filter(connection => !connection.user).send({ _id: data._id, inaccessible: false }),
    //     ]
    //   }
    //   return [
    //     channel.filter(connection => {
    //       return connection.user && data.allowedViewers.includes(allowUser(connection.user._id))
    //     }),
    //     channel.filter(connection => {
    //       return !connection.user || !data.allowedViewers.includes(allowUser(connection.user._id))
    //     }).send({ _id: data._id, inaccessible: false })
    //   ]
    // })
  })

  const allowUser = (userId: string) => `user:${userId}`;
  class EventAccessStrategy implements AccessStrategy<Static<typeof eventAccessDataSchema>> {
    store = app.service('access').getStore('events', eventAccessDataSchema, {
      viewers: ['everyone']
    })
    async authorize(action: Action, user?: User, entityId?: Id, accessData?: Static<typeof eventAccessDataSchema>) {
      if (action === 'create') {
        return {
          validity: 'global',
          appliesTo: 'user',
          hasPermission: !!user,
        } as const
      }
      if (action !== 'read') {
        return {
          validity: 'global',
          appliesTo: 'user',
          hasPermission: !!user && this.hasAccess(accessData?.viewers || [], user?._id),
        } as const
      }
      if (!entityId || !accessData) {
        return {
          validity: 'entity',
          appliesTo: 'user',
          hasPermission: undefined,
        } as const
      }

      const { viewers } = accessData

      return {
        validity: 'entity',
        appliesTo: 'user',
        hasPermission: this.hasAccess(viewers, user?._id)
      } as const
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
