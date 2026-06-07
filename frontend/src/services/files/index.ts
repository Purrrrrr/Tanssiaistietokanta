import { backendQueryHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, makeMutationHook, setupServiceUpdateFragment } from 'backend'

export { doUpload, getUploadError, MAX_UPLOAD_SIZE, type UploadedFile } from './upload'

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
  query getFiles($owner: FileOwner!, $owningId: ID!, $path: String) {
    files(owner: $owner, owningId: $owningId, path: $path) {
      _id
      _updatedAt
      name
      size
    }
  }
`))

export const useFilesCount = backendQueryHook(graphql(`
  query getFilesCount($owner: FileOwner!, $owningId: ID!, $path: String) {
    filesCount(owner: $owner, owningId: $owningId, path: $path)
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
