import { Id } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { FileParams } from './files.class'

export default (app: Application) => {
  const service = app.service('files')

  return {
    Query: {
      file: (_: any, { id }: any, params: FileParams | undefined) => service.get(id, params),
      files: (_: any, { owner, owningId, path = '' }: any, params: FileParams | undefined) => service.find({
        ...params,
        query: {
          owner, owningId, path,
        },
      }),
    },
    Mutation: {
      renameFile: (_: any, { id, name }: any, params: FileParams | undefined) => service.patch(id, { name }, params),
      moveFile: (_: any, { id, name, path }: any, params: FileParams | undefined) => service.patch(id, { name, path }, params),
      deleteFile: (_: any, { id }: any, params: FileParams | undefined) => service.remove(id, params),
      markFileUsage: (_: any, { usages }: { usages: { _id: Id, unused: boolean }[] }) => {
        return Promise.all(
          usages.map(({ _id, unused }) => service.patch(_id, { unused })),
        )
      },
    },
  }
}
