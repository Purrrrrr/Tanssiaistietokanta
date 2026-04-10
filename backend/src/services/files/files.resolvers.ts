import { Id } from '@feathersjs/feathers'
import { Application, Resolvers } from '../../declarations'

export default (app: Application): Resolvers => {
  const service = app.service('files')

  return {
    Query: {
      file: (_, { id }, params) => service.get(id, params),
      files: (_, { owner, owningId, path }, params) => service.find({
        ...params,
        query: {
          owner, owningId, path: path ?? '',
        },
      }),
    },
    Mutation: {
      renameFile: (_, { id, name }, params) => service.patch(id, { name }, params),
      moveFile: (_, { id, name, path }, params) => service.patch(id, { name, path: path ?? '' }, params),
      deleteFile: (_, { id }, params) => service.remove(id, params),
      markFileUsage: (_, { usages }: { usages: { _id: Id, unused: boolean }[] }) => {
        return Promise.all(
          usages.map(({ _id, unused }) => service.patch(_id, { unused })),
        )
      },
    },
  }
}
