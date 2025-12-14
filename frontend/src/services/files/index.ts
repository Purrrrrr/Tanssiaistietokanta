import { entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, makeMutationHook, setupServiceUpdateFragment } from 'backend'

export * from './upload'

export const useDeleteFile = entityDeleteHook('files', graphql(`
mutation deleteFile($id: ID!) {
  deleteFile(id: $id) {
    _id
    _updatedAt
    name
    size
  }
}`))

setupServiceUpdateFragment(
  'files',
  `fragment FileFragment on File {
    _id
    _updatedAt
    name
    size
  }`,
)

export const useFiles = entityListQueryHook('files', graphql(`
  query getFiles($root: String!, $path: String) {
    files(root: $root, path: $path) {
      _id
      _updatedAt
      name
      size
    }
  }
`))

export const useRenameFile = entityUpdateHook('files', graphql(`
mutation renameFile($id: ID!, $name: String!, $path: String) {
  renameFile(id: $id, name: $name, path: $path) {
    _id
    _updatedAt
    name
    size
  }
}`))

export const useMarkFileUsage = makeMutationHook(graphql(`
mutation markFileUsage($usages: [FileUsageInput!]!) {
  markFileUsage(usages: $usages) {
    _id
    _updatedAt
    name
    size
  }
}
`))
