// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  eventRolesDataValidator,
  eventRolesPatchValidator,
  eventRolesQueryValidator,
  eventRolesResolver,
  eventRolesExternalResolver,
  eventRolesDataResolver,
  eventRolesPatchResolver,
  eventRolesQueryResolver,
} from './eventRoles.schema'

import type { Application } from '../../declarations'
import { EventRolesService, getOptions } from './eventRoles.class'
import { eventRolesPath, eventRolesMethods } from './eventRoles.shared'
import { defaultChannels } from '../../utils/defaultChannels'

export * from './eventRoles.class'
export * from './eventRoles.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const eventRoles = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventRolesPath, new EventRolesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventRolesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(eventRolesPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(eventRolesExternalResolver), schemaHooks.resolveResult(eventRolesResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(eventRolesQueryValidator), schemaHooks.resolveQuery(eventRolesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(eventRolesDataValidator), schemaHooks.resolveData(eventRolesDataResolver)],
      patch: [schemaHooks.validateData(eventRolesPatchValidator), schemaHooks.resolveData(eventRolesPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  app.service('access').setAccessStrategy('eventRoles', {
    authTarget: 'everything',
    authorize({ user, action }) {
      if (action === 'read' || action === 'list') {
        return true
      }

      return user?.groups.includes('admins') ?? false
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventRolesPath]: EventRolesService
  }
}
