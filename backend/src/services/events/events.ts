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
  EventGrantRole,
} from './events.schema'

import type { Application } from '../../declarations'
import { EventsService, getOptions } from './events.class'
import { eventsPath, eventsMethods } from './events.shared'
import { mergeJsonPatch, SupportsJsonPatch } from '../../hooks/merge-json-patch'
import { AccessStrategy, AuthParams } from '../access/strategies'
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
            omit(['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt']) as (data: unknown) => unknown,
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

  const roleHierarchy: Record<EventGrantRole, number> = { viewer: 1, teacher: 2, organizer: 3 }

  class EventAccessStrategy implements AccessStrategy<'events', EventAccessData, 'modify-volunteers'> {
    store = app.service('access').getStore('events', eventAccessDataSchema, {
      viewAccess: 'limited',
      grants: [],
    })

    authTarget = 'entity' as const

    extraActions = ['modify-volunteers' as const]
    async authorize({ action, entityData, user }: AuthParams<EventAccessData, 'modify-volunteers'>) {
      if (user?.groups.includes('admins')) {
        return true
      }
      if (action === 'list') {
        return true
      }
      if (action === 'create') {
        return !!user
      }
      if (!entityData) {
        return undefined
      }

      const { viewAccess, grants } = entityData
      const userRole = this.getUserRole(grants, user)

      if (action === 'read') {
        return viewAccess === 'public' || userRole !== null
      }
      if (action === 'manage-access' || action === 'modify-volunteers' || action === 'delete') {
        return userRole === 'organizer'
      }
      // action === 'modify'
      return userRole === 'teacher' || userRole === 'organizer'
    }

    getUserRole(grants: EventAccessData['grants'], user?: User | null): EventGrantRole | null {
      if (!user) {
        return null
      }

      const userPrincipal = `user:${user._id}`
      const groupPrincipals = user.groups.map(group => `group:${group}`)

      let highestRole: EventGrantRole | null = null

      for (const grant of grants) {
        if (grant.principal === userPrincipal || groupPrincipals.includes(grant.principal)) {
          if (!highestRole || roleHierarchy[grant.role] > roleHierarchy[highestRole]) {
            highestRole = grant.role
          }
        }
      }

      return highestRole
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

declare module '../access/access.class' {
  interface ServiceExtraActions {
    events: 'modify-volunteers'
  }
}
