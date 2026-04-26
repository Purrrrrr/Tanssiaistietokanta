import { Application, Resolvers } from '../../declarations'
import { EventVolunteerAssignments } from './eventVolunteerAssignments.class'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('eventVolunteerAssignments')
  const eventService = app.service('events')
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
          await eventService.startVersionedSearchFrom(eventVersionId)
        } else if (workshopVersionId) {
          await workshopsService.startVersionedSearchFrom(workshopVersionId)
        }
        return service.find({ ...params, query: removeNulls(query) })
      },
    },
    Mutation: {
      createEventVolunteerAssignment: (_, { eventVolunteerAssignment }, params) => service.create(eventVolunteerAssignment, params),
      // modifyEventVolunteerAssignment: (_, { id, eventVolunteerAssignment }, params) => service.update(id, eventVolunteerAssignment, params),
      // patchEventVolunteerAssignment: (_, { id, eventVolunteerAssignment }, params) => service.patch(id, eventVolunteerAssignment, params),
      setEventVolunteerAssignmentWorkshopInstances: async (_, { id, workshopInstanceIds }, params) =>
        service.patch(id, { workshopInstanceIds }, params),
      deleteEventVolunteerAssignment: (_, { id }, params) => service.remove(id, params),
    },
  }
}
