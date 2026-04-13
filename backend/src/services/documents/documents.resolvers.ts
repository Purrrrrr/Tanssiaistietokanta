import { Application, Resolvers } from '../../declarations'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { versionHistoryResolver } from '../graphql/versionHistory.resolvers'
import { GraphQLScalarType } from 'graphql'

export default (app: Application): Resolvers => {
  const service = app.service('documents')

  return {
    DocumentContent: new GraphQLScalarType({
      name: 'DocumentContent',
      description: 'Arbitrary JSON content, e.g. a Lexical editor document',
      serialize: (value) => value,
      parseValue: (value) => value,
      parseLiteral: (ast) => ast,
    }),
    Document: {
      versionHistory: versionHistoryResolver(service),
    },
    Query: {
      document: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      documents: (_, { owner, owningId, path }, params) => service.find({
        ...params,
        query: { owner, owningId, path: path ?? '' },
      }),
    },
    Mutation: {
      createDocument: (_, { owner, owningId, path, title, content }, params) =>
        service.create({ owner, owningId, path: path ?? '', title, content }, params),
      patchDocument: (_, { id, document }, params) =>
        service.patch(id, document as JSONPatch, { ...params, jsonPatch: true }),
      deleteDocument: (_, { id }, params) => service.remove(id, params),
    },
  }
}
