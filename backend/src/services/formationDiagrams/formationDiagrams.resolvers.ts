import { Application, Resolvers } from '../../declarations'

import { toSelect } from '../../utils/resolvers'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { ballroomsSchema } from '../ballrooms/ballrooms.schema'

export default (app: Application): Resolvers => {
  const service = app.service('formationDiagrams')
  const ballroomService = app.service('ballrooms')

  return {
    FormationDiagram: {
      ballroom: (formationDiagram, _, __, info) => {
        console.log('formationDiagram.ballroomId', formationDiagram)
        return ballroomService.get(formationDiagram.ballroomId, { query: { $select: toSelect(info, ballroomsSchema) } })
      },
    },
    Query: {
      formationDiagram: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      formationDiagrams: (_, __, params) => service.find(params),
    },
    Mutation: {
      createFormationDiagram: async (_, { formationDiagram }, params) => await service.create(formationDiagram, params),
      patchFormationDiagram: (_, { id, formationDiagram }, params) =>
        service.patch(id, formationDiagram as JSONPatch, { ...params, jsonPatch: true }),
      deleteFormationDiagram: (_, { id }, params) => service.remove(id, params),
    },
  }
}
