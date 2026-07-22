import { Application, Resolvers } from '../../declarations'

import { toSelect } from '../../utils/resolvers'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { ballroomsSchema } from '../ballrooms/ballrooms.schema'
import { dancesSchema } from '../dances/dances.schema'

export default (app: Application): Resolvers => {
  const service = app.service('formationDiagrams')
  const ballroomService = app.service('ballrooms')

  return {
    FormationDiagram: {
      ballroom: (formationDiagram, _, __, info) => {
        if (!formationDiagram.ballroomId) return null
        return ballroomService.get(formationDiagram.ballroomId, { query: { $select: toSelect(info, ballroomsSchema) } })
      },
      dances: (formationDiagram, _, __, info) => {
        return app.service('dances').find({
          query: {
            formationDiagramIds: formationDiagram._id,
            $select: toSelect(info, dancesSchema),
          },
        })
      },
    },
    Query: {
      formationDiagram: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      formationDiagrams: (_, __, params) => service.find(params),
    },
    Mutation: {
      createFormationDiagram: async (_, { formationDiagram: { ballroomId, ...rest } }, params) => await service.create({
        ...rest,
        ballroomId: ballroomId ?? null,
      }, params),
      patchFormationDiagram: (_, { id, formationDiagram }, params) =>
        service.patch(id, formationDiagram as JSONPatch, { ...params, jsonPatch: true }),
      deleteFormationDiagram: (_, { id }, params) => service.remove(id, params),
    },
  }
}
