// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  eventVolunteerAssignmentsDataValidator,
  eventVolunteerAssignmentsPatchValidator,
  eventVolunteerAssignmentsQueryValidator,
  eventVolunteerAssignmentsResolver,
  eventVolunteerAssignmentsExternalResolver,
  eventVolunteerAssignmentsDataResolver,
  eventVolunteerAssignmentsPatchResolver,
  eventVolunteerAssignmentsQueryResolver,
} from './eventVolunteerAssignments.schema'

import type { Application } from '../../declarations'
import { EventVolunteerAssignmentsService, getOptions } from './eventVolunteerAssignments.class'
import { eventVolunteerAssignmentsPath, eventVolunteerAssignmentsMethods } from './eventVolunteerAssignments.shared'
import { defaultChannels } from '../../utils/defaultChannels'
import { SkipAccessControl } from '../access/hooks'

export * from './eventVolunteerAssignments.class'
export * from './eventVolunteerAssignments.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const eventVolunteerAssignments = (app: Application) => {
  // Register our service on the Feathers application
  app.use(eventVolunteerAssignmentsPath, new EventVolunteerAssignmentsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventVolunteerAssignmentsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(eventVolunteerAssignmentsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(eventVolunteerAssignmentsExternalResolver), schemaHooks.resolveResult(eventVolunteerAssignmentsResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(eventVolunteerAssignmentsQueryValidator), schemaHooks.resolveQuery(eventVolunteerAssignmentsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(eventVolunteerAssignmentsDataValidator), schemaHooks.resolveData(eventVolunteerAssignmentsDataResolver)],
      patch: [schemaHooks.validateData(eventVolunteerAssignmentsPatchValidator), schemaHooks.resolveData(eventVolunteerAssignmentsPatchResolver)],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  const service = app.service(eventVolunteerAssignmentsPath)
  const accessService = app.service('access')

  accessService.setAccessStrategy('eventVolunteerAssignments', {
    authTarget: 'owner',
    getOwnerFromData(data) {
      return data ? { owningId: data.eventId } : undefined
    },
    async getEntityOwner(entityId) {
      const result = await service.get(entityId, { [SkipAccessControl]: true, query: { $select: ['eventId'] } })
      return { owner: 'events', owningId: result.eventId }
    },
    authorize({ user, owningId: eventId }) {
      return accessService.hasAccess('events', 'modify-volunteers', user, eventId)
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventVolunteerAssignmentsPath]: EventVolunteerAssignmentsService
  }
}
