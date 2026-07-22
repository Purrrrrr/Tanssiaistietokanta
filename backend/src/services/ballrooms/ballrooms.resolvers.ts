import { Application, Resolvers } from '../../declarations'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { removeNulls } from '../../utils/common-types'
import { toSelect } from '../../utils/resolvers'
import { formationDiagramSchema } from '../formationDiagrams/formationDiagrams.schema'

export default (app: Application): Resolvers => {
  const service = app.service('ballrooms')

  return {
    Query: {
      ballroom: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      ballrooms: (_, __, params) => service.find(params),
    },
    Ballroom: {
      formationDiagrams: (ballroom, _, __, info) => {
        return app.service('formationDiagrams').find({
          query: {
            ballroomId: ballroom._id,
            $select: toSelect(info, formationDiagramSchema),
          },
        })
      },
    },
    Mutation: {
      createBallroom: (_, { ballroom }, params) => service.create(removeNulls(ballroom), params),
      patchBallroom: (_, { id, ballroom }, params) =>
        service.patch(id, ballroom as JSONPatch, { ...params, jsonPatch: true }),
      deleteBallroom: (_, { id }, params) => service.remove(id, params),
    },
  }
}
