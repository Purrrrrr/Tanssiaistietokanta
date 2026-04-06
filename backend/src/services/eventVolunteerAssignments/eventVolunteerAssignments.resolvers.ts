import { Application } from '../../declarations'
import { EventVolunteerAssignmentsParams } from './eventVolunteerAssignments.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
  const service = app.service('eventVolunteerAssignments')
  const eventsService = app.service('events')
  const workshopsService = app.service('workshops')
  const eventRolesService = app.service('eventRoles')
  const volunteerService = app.service('volunteers')

  return {
    EventVolunteerAssignment: {
      versionHistory: versionHistoryResolver(service),
      event: (assignment: { eventId: string }) => eventsService.get(assignment.eventId),
      workshop: (assignment: { workshopId: string | null }) =>
        assignment.workshopId ? workshopsService.get(assignment.workshopId) : null,
      role: (assignment: { roleId: string }) => eventRolesService.get(assignment.roleId),
      volunteer: (assignment: { volunteerId: string }) => volunteerService.get(assignment.volunteerId),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      eventVolunteerAssignment: (_: any, { id, versionId }: any, params: EventVolunteerAssignmentsParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventVolunteerAssignments: (_: any, { eventId, workshopId }: { eventId?: string, workshopId?: string }, params: EventVolunteerAssignmentsParams | undefined) => {
        const query: Record<string, string> = {}
        if (eventId) query.eventId = eventId
        if (workshopId) query.workshopId = workshopId
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
