import type { MetadataKey, MetadataObject } from 'types'

export { updateEntityFragment } from './apolloCache'
export type { FetchRequestProgress, RestRequestWithProgressOptions } from './connection'
export { restRequestWithProgress, socketRequest } from './connection'
export { addGlobalLoadingAnimation, useShowGlobalLoadingAnimation } from './globalLoadingState'
export {
  backendQueryHook,
  entityCreateHook,
  entityDeleteHook,
  entityListQueryHook,
  entityUpdateHook,
  makeMutationHook,
} from './hooks'
export { setupServiceUpdateFragment, useServiceEvents } from './serviceEvents'
export { graphql } from 'types/gql'

export function cleanMetadataValues<T extends MetadataObject>(value: MetadataObject): Omit<T, MetadataKey> {
  const { _id, _versionId, _versionNumber, _updatedAt, ...rest } = value
  return rest as Omit<T, MetadataKey>
}
