import { Application, Resolvers } from '../../declarations'
import { EventVolunteerAssignmentsQuery } from '../eventVolunteerAssignments/eventVolunteerAssignments.class'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('volunteers')
  const assignmentsService = app.service('eventVolunteerAssignments')

  return {
    Volunteer: {
      volunteeredIn: async (volunteer, { eventId }, params) => {
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
    Query: {
      volunteer: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      volunteers: (_, __, params) => service.find(params),
    },
    Mutation: {
      createVolunteer: (_, { volunteer }, params) => service.create(volunteer, params),
      patchVolunteer: (_, { id, volunteer }, params) => {
        const { duplicatedBy, ...rest } = volunteer
        return service.patch(id, { duplicatedBy, ...removeNulls(rest) }, params)
      },
      deleteVolunteer: (_, { id }, params) => service.remove(id, params),
    },
  }
}
