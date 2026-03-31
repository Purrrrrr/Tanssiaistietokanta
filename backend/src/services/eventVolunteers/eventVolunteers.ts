// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  eventVolunteersDataValidator,
  eventVolunteersPatchValidator,
  eventVolunteersQueryValidator,
  eventVolunteersResolver,
  eventVolunteersExternalResolver,
  eventVolunteersDataResolver,
  eventVolunteersPatchResolver,
  eventVolunteersQueryResolver,
} from './eventVolunteers.schema'

import type { Application } from '../../declarations'
import { EventVolunteersService, getOptions } from './eventVolunteers.class'
import { eventVolunteersPath, eventVolunteersMethods } from './eventVolunteers.shared'
import { defaultChannels } from '../../utils/defaultChannels'

export * from './eventVolunteers.class'
export * from './eventVolunteers.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const eventVolunteers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventVolunteersPath, new EventVolunteersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventVolunteersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(eventVolunteersPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(eventVolunteersExternalResolver), schemaHooks.resolveResult(eventVolunteersResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(eventVolunteersQueryValidator), schemaHooks.resolveQuery(eventVolunteersQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(eventVolunteersDataValidator), schemaHooks.resolveData(eventVolunteersDataResolver)],
      patch: [schemaHooks.validateData(eventVolunteersPatchValidator), schemaHooks.resolveData(eventVolunteersPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  app.service('access').setAccessStrategy('eventVolunteers', {
    authTarget: 'everything',
    authorize({ user, action }) {
      if (action === 'read' || action === 'list') {
        return true
      }

      return !!user
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventVolunteersPath]: EventVolunteersService
  }
}
