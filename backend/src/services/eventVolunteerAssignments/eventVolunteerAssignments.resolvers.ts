import { Application, Resolvers } from '../../declarations'
import { EventVolunteerAssignments } from './eventVolunteerAssignments.class'
import { eventsSchema } from '../events/events.schema'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('eventVolunteerAssignments')
  const eventsService = app.service('events')
  const workshopsService = app.service('workshops')
  const eventRolesService = app.service('eventRoles')

  async function groupByRole(
    assignments: EventVolunteerAssignments[],
    ids: { _eventId: string, _workshopId: string | null },
  ) {
    const byRole = new Map<string, string[]>()
    for (const a of assignments) {
      const roleAssignments = byRole.get(a.roleId)
      if (!roleAssignments) {
        byRole.set(a.roleId, [a.volunteerId])
      } else {
        roleAssignments.push(a.volunteerId)
      }
    }
    return Promise.all(
      byRole.entries().map(async ([roleId, roleAssignments]) => ({
        _id: roleId,
        ...ids,
        role: await eventRolesService.get(roleId),
        volunteers: await Promise.all(roleAssignments.map(id => volunteerService.get(id))),
      })),
    )
  } const volunteerService = app.service('volunteers')

  return {
    EventVolunteerAssignment: {
      event: (assignment, _, __, ctx) => eventsService.get(assignment.eventId),
      workshop: (assignment) => assignment.workshopId ? workshopsService.get(assignment.workshopId) : null,
      role: (assignment) => eventRolesService.get(assignment.roleId),
      volunteer: (assignment) => volunteerService.get(assignment.volunteerId),
    },
    Event: {
      volunteerAssignments: async (event, _args, params) => {
        const assignments = await service.find({
          ...params,
          query: { eventId: event._id, workshopId: null },
        })
        return groupByRole(assignments, { _eventId: event._id, _workshopId: null })
      },
    },
    Workshop: {
      volunteerAssignments: (workshop, _args, params) =>
        service.find({ ...params, query: { workshopId: workshop._id } })
          .then(assignments =>
            groupByRole(assignments, { _eventId: workshop.eventId, _workshopId: workshop._id })),
    },
    Query: {
      eventVolunteerAssignment: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventVolunteerAssignments: async (
        _,
        { eventVersionId, workshopVersionId, ...query },
        params,
      ) => {
        if (eventVersionId) {
          // Trigger searching of versions of event volunteer assignments by event version id
          await eventsService.find({ query: { _versionId: eventVersionId } })
        }
        if (workshopVersionId) {
          // Trigger searching of versions of event volunteer assignments by event version id
          await workshopsService.find({ query: { _versionId: workshopVersionId } })
        }
        return service.find({ ...params, query: removeNulls(query) })
      },
    },
    Mutation: {
      createEventVolunteerAssignment: (_, { eventVolunteerAssignment }, params) => service.create(eventVolunteerAssignment, params),
      // modifyEventVolunteerAssignment: (_, { id, eventVolunteerAssignment }, params) => service.update(id, eventVolunteerAssignment, params),
      // patchEventVolunteerAssignment: (_, { id, eventVolunteerAssignment }, params) => service.patch(id, eventVolunteerAssignment, params),
      deleteEventVolunteerAssignment: (_, { id }, params) => service.remove(id, params),
    },
  }
}
