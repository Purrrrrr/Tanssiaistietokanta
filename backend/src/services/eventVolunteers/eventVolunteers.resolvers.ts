import { Application, Resolvers } from '../../declarations'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('eventVolunteers')
  const volunteerService = app.service('volunteers')
  const eventRolesService = app.service('eventRoles')
  const eventService = app.service('events')

  return {
    EventVolunteer: {
      volunteer: (eventVolunteer: { volunteerId: string }) => volunteerService.get(eventVolunteer.volunteerId),
      interestedIn: (eventVolunteer: { interestedIn: string[] }) =>
        Promise.all(eventVolunteer.interestedIn.map(id => eventRolesService.get(id))),
    },
    Query: {
      eventVolunteer: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventVolunteers: async (_, { eventId, eventVersionId, volunteerId }, params) => {
        const query: Record<string, string> = {}
        if (eventId) {
          query.eventId = eventId
          if (eventVersionId) {
            await eventService.startVersionedSearchFrom(eventVersionId)
          }
        }
        if (volunteerId) query.volunteerId = volunteerId
        return service.find({ ...params, query })
      },
    },
    Mutation: {
      createEventVolunteer: (_, { eventVolunteer }, params) => service.create(removeNulls(eventVolunteer), params),
      patchEventVolunteer: (_, { id, eventVolunteer }, params) => service.patch(id, removeNulls(eventVolunteer), params),
      deleteEventVolunteer: (_, { id }, params) => service.remove(id, params),
    },
  }
}
