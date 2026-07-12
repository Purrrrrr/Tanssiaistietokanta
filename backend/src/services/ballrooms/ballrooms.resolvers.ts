import { Application, Resolvers } from '../../declarations'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const service = app.service('ballrooms')

  return {
    Query: {
      ballroom: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      ballrooms: (_, __, params) => service.find(params),
    },
    Mutation: {
      createBallroom: (_, { ballroom }, params) => service.create(removeNulls(ballroom), params),
      patchBallroom: (_, { id, ballroom }, params) =>
        service.patch(id, ballroom as JSONPatch, { ...params, jsonPatch: true }),
      deleteBallroom: (_, { id }, params) => service.remove(id, params),
    },
  }
}
