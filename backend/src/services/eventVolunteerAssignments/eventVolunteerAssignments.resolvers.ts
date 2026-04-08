import { Application } from '../../declarations'
import { EventVolunteerAssignments, EventVolunteerAssignmentsParams } from './eventVolunteerAssignments.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
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
      versionHistory: versionHistoryResolver(service),
      event: (assignment: { eventId: string }) => eventsService.get(assignment.eventId),
      workshop: (assignment: { workshopId: string | null }) =>
        assignment.workshopId ? workshopsService.get(assignment.workshopId) : null,
      role: (assignment: { roleId: string }) => eventRolesService.get(assignment.roleId),
      volunteer: (assignment: { volunteerId: string }) => volunteerService.get(assignment.volunteerId),
    },
    Event: {
      volunteerAssignments: async (event: { _id: string, _versionId?: string | null, _updatedAt: string }, _: unknown, params: EventVolunteerAssignmentsParams | undefined) => {
        const assignments = await service.find({
          ...params,
          query: { ...params?.query, eventId: event._id, workshopId: null },
        })
        return groupByRole(assignments, { _eventId: event._id, _workshopId: null })
      },
    },
    Workshop: {
      volunteerAssignments: (workshop: { eventId: string, _id: string }, _: unknown, params: EventVolunteerAssignmentsParams | undefined) =>
        service.find({ ...params, query: { ...params?.query, workshopId: workshop._id } })
          .then(assignments =>
            groupByRole(assignments, { _eventId: workshop.eventId, _workshopId: workshop._id })),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      eventVolunteerAssignment: (_: any, { id, versionId }: any, params: EventVolunteerAssignmentsParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventVolunteerAssignments: (_: any, { eventId, workshopId, roleId }: { eventId?: string, workshopId?: string, roleId?: string }, params: EventVolunteerAssignmentsParams | undefined) => {
        const query: Record<string, string> = {}
        if (eventId) query.eventId = eventId
        if (workshopId) query.workshopId = workshopId
        if (roleId) query.roleId = roleId
        return service.find({ ...params, query: { ...params?.query, ...query } })
      },
    },
    Mutation: {
      createEventVolunteerAssignment: (_: any, { eventVolunteerAssignment }: any, params: EventVolunteerAssignmentsParams | undefined) => service.create(eventVolunteerAssignment, params),
      // modifyEventVolunteerAssignment: (_: any, { id, eventVolunteerAssignment }: any, params: EventVolunteerAssignmentsParams | undefined) => service.update(id, eventVolunteerAssignment, params),
      // patchEventVolunteerAssignment: (_: any, { id, eventVolunteerAssignment }: any, params: EventVolunteerAssignmentsParams | undefined) => service.patch(id, eventVolunteerAssignment, params),
      deleteEventVolunteerAssignment: (_: any, { id }: any, params: EventVolunteerAssignmentsParams | undefined) => service.remove(id, params),
    },
  }
}
