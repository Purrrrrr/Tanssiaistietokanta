// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'

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

import type { Application, HookContext } from '../../declarations'
import { EventVolunteersService, getOptions } from './eventVolunteers.class'
import { eventVolunteersPath, eventVolunteersMethods } from './eventVolunteers.shared'
import { defaultChannels } from '../../utils/defaultChannels'
import { SkipAccessControl } from '../access/hooks'
import { withEntity } from '../../hooks/withEntity'
import type { EventVolunteers } from './eventVolunteers.schema'

export * from './eventVolunteers.class'
export * from './eventVolunteers.schema'

function captureAcceptedRoles() {
  return (context: HookContext) => {
    if (Array.isArray(context.data?.acceptedRoles)) {
      context.params._acceptedRoles = context.data.acceptedRoles as string[]
    }
  }
}

function validateStatusTransition(app: Application) {
  return async (context: HookContext) => {
    const newStatus = context.data?.status
    if (!newStatus || newStatus === 'Accepted' || newStatus === 'Cancelled') return
    if (!context.id) return

    const hasRegisteredAssignments = await app.service('eventVolunteerAssignments').exists({
      query: { eventVolunteerId: context.id as string, registrationStatus: { $ne: 'None' } },
      [SkipAccessControl]: true,
    } as any)
    if (hasRegisteredAssignments) {
      throw new BadRequest('Cannot change volunteer status: there are assignments with active registration')
    }
  }
}

function syncAssignments(app: Application) {
  return async (context: HookContext) => {
    const volunteer = context.result as EventVolunteers
    const { status, _id: eventVolunteerId, eventId, volunteerId } = volunteer
    const acceptedRoles: string[] | undefined = context.params._acceptedRoles

    if (status === 'Cancelled') return

    const assignmentsService = app.service('eventVolunteerAssignments')
    const rolesService = app.service('eventRoles')

    const allRoles = await rolesService.find({ [SkipAccessControl]: true } as any)
    const nonWorkshopRoleIds = new Set(allRoles.filter(r => !r.appliesToWorkshops).map(r => r._id as string))

    const existingAssignments = await assignmentsService.find({
      query: { eventVolunteerId },
      [SkipAccessControl]: true,
    } as any)
    const existingNonWorkshop = existingAssignments.filter(a => nonWorkshopRoleIds.has(a.roleId))

    if (status === 'Accepted' && acceptedRoles !== undefined) {
      const wantedNonWorkshop = acceptedRoles.filter(id => nonWorkshopRoleIds.has(id))
      const wantedSet = new Set(wantedNonWorkshop)

      for (const assignment of existingNonWorkshop) {
        if (!wantedSet.has(assignment.roleId)) {
          await assignmentsService.remove(assignment._id, { [SkipAccessControl]: true } as any)
        }
      }

      const existingRoleIds = new Set(existingNonWorkshop.map(a => a.roleId))
      for (const roleId of wantedNonWorkshop) {
        if (!existingRoleIds.has(roleId)) {
          await assignmentsService.create(
            { eventId, volunteerId, roleId, workshopId: null, workshopInstanceIds: null },
            { [SkipAccessControl]: true } as any,
          )
        }
      }
    } else if (status !== 'Accepted') {
      for (const assignment of existingNonWorkshop) {
        await assignmentsService.remove(assignment._id, { [SkipAccessControl]: true } as any)
      }
    }
  }
}

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
      create: [captureAcceptedRoles(), schemaHooks.validateData(eventVolunteersDataValidator), schemaHooks.resolveData(eventVolunteersDataResolver)],
      patch: [captureAcceptedRoles(), validateStatusTransition(app), schemaHooks.validateData(eventVolunteersPatchValidator), schemaHooks.resolveData(eventVolunteersPatchResolver)],
      remove: [
        withEntity('eventVolunteers', { query: { $select: ['status', '_isRegistered'] } }, volunteer => {
          if (volunteer.status !== 'Interested') {
            throw new Error('Cannot remove a volunteer with status other than Interested')
          }
          if (volunteer._isRegistered) {
            throw new Error('Cannot remove a volunteer with registered assignment(s)')
          }
        }),
      ],
    },
    after: {
      all: [],
      create: [syncAssignments(app)],
      patch: [syncAssignments(app)],
    },
    error: {
      all: [],
    },
  }).publish((_data, context) => defaultChannels(app, context))

  const service = app.service(eventVolunteersPath)
  const accessService = app.service('access')

  accessService.setAccessStrategy('eventVolunteers', {
    authTarget: 'owner',
    getOwnerFromData(data) {
      return data ? { owningId: data.eventId } : undefined
    },
    async getEntityOwner(entityId) {
      const result = await service.get(entityId, { [SkipAccessControl]: true, query: { $select: ['eventId'] } })
      return { owner: 'events', owningId: result.eventId }
    },
    authorize({ user, action, owningId: eventId }) {
      if (action === 'list') return true
      const effectiveAction = action === 'read' ? 'read' : 'modify-volunteers'
      return accessService.hasAccess('events', effectiveAction, user, eventId)
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [eventVolunteersPath]: EventVolunteersService
  }
}
