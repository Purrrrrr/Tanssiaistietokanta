import { Application } from '../../declarations'
import { EventVolunteersParams } from './eventVolunteers.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
  const service = app.service('eventVolunteers')

  return {
    EventVolunteer: {
      versionHistory: versionHistoryResolver(service),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      eventVolunteer: (_: any, { id, versionId }: any, params: EventVolunteersParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventVolunteers: (_: any, { eventId, volunteerId }: { eventId?: string, volunteerId?: string }, params: EventVolunteersParams | undefined) => {
        const query: Record<string, string> = {}
        if (eventId) query.eventId = eventId
        if (volunteerId) query.volunteerId = volunteerId
        return service.find({ ...params, query: { ...params?.query, ...query } })
      },
    },
    Mutation: {
      createEventVolunteer: (_: any, { eventVolunteer }: any, params: EventVolunteersParams | undefined) => service.create(eventVolunteer, params),
      modifyEventVolunteer: (_: any, { id, eventVolunteer }: any, params: EventVolunteersParams | undefined) => service.update(id, eventVolunteer, params),
      patchEventVolunteer: (_: any, { id, eventVolunteer }: any, params: EventVolunteersParams | undefined) => service.patch(id, eventVolunteer, params),
      deleteEventVolunteer: (_: any, { id }: any, params: EventVolunteersParams | undefined) => service.remove(id, params),
    },
  }
}
