import { Application, Resolvers } from '../../declarations'
// import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('eventRoles')

  return {
    Query: {
      eventRole: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      eventRoles: (_, { appliesToWorkshops }, params) =>
        service.find({
          ...params,
          query: {
            $sort: { order: 1 },
            ...(appliesToWorkshops != undefined ? { appliesToWorkshops } : {}),
          },
        }),
    },
    // Mutation: {
    //   createEventRole: (_, { eventRole }, params) => service.create(removeNulls(eventRole), params),
    //   patchEventRole: (_, { id, eventRole }, params) => service.patch(id, removeNulls(eventRole), params),
    //   deleteEventRole: (_, { id }, params) => service.remove(id, params),
    // },
  }
}
