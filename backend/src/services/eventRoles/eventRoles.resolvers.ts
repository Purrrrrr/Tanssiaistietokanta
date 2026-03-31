import { Application } from '../../declarations'
import { EventRolesParams } from './eventRoles.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
  const service = app.service('eventRoles')

  return {
    EventRole: {
      versionHistory: versionHistoryResolver(service),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      eventRole: (_: any, { id, versionId }: any, params: EventRolesParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventRoles: (_: any, { appliesToWorkshops }: { appliesToWorkshops?: boolean }, params: EventRolesParams | undefined) =>
        service.find({
          ...params,
          query: {
            $sort: { order: 1 },
            ...params?.query,
            ...(appliesToWorkshops !== undefined ? { appliesToWorkshops } : {}),
          },
        }),
    },
    Mutation: {
      createEventRole: (_: any, { eventRole }: any, params: EventRolesParams | undefined) => service.create(eventRole, params),
      modifyEventRole: (_: any, { id, eventRole }: any, params: EventRolesParams | undefined) => service.update(id, eventRole, params),
      patchEventRole: (_: any, { id, eventRole }: any, params: EventRolesParams | undefined) => service.patch(id, eventRole, params),
      deleteEventRole: (_: any, { id }: any, params: EventRolesParams | undefined) => service.remove(id, params),
    },
  }
}
