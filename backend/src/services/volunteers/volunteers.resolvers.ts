import { Application } from '../../declarations'
import { VolunteersParams } from './volunteers.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'
import { EventVolunteerAssignmentsParams, EventVolunteerAssignmentsQuery } from '../eventVolunteerAssignments/eventVolunteerAssignments.class'

export default (app: Application) => {
  const service = app.service('volunteers')
  const assignmentsService = app.service('eventVolunteerAssignments')

  return {
    Volunteer: {
      versionHistory: versionHistoryResolver(service),
      volunteeredIn: async (volunteer: { _id: string }, { eventId }: { eventId?: string }, params: EventVolunteerAssignmentsParams | undefined) => {
        const duplicates = await service.find({ query: { duplicatedBy: volunteer._id, $select: ['_id'] } })
        const query: EventVolunteerAssignmentsQuery = {
          volunteerId: duplicates.length > 0
            ? { $in: [volunteer._id, ...duplicates.map(v => v._id)] }
            : volunteer._id,
        }
        if (eventId) {
          query.eventId = eventId
        }
        return assignmentsService.find({ ...params, query })
      },
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      volunteer: (_: any, { id, versionId }: any, params: VolunteersParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      volunteers: (_: any, __: any, params: VolunteersParams | undefined) => service.find(params),
    },
    Mutation: {
      createVolunteer: (_: any, { volunteer }: any, params: VolunteersParams | undefined) => service.create(volunteer, params),
      patchVolunteer: (_: any, { id, volunteer }: any, params: VolunteersParams | undefined) => service.patch(id, volunteer, params),
      deleteVolunteer: (_: any, { id }: any, params: VolunteersParams | undefined) => service.remove(id, params),
    },
  }
}
