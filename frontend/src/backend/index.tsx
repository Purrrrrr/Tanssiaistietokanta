import { apolloClient, ApolloProvider } from './apollo'
import { subscribeToAuthChanges } from './authentication'
import { setAccessToken } from './connection'

export { updateEntityFragment } from './apolloCache'
export {
  type FetchRequestProgress,
  isConnected,
  restRequestWithProgress,
  type RestRequestWithProgressOptions,
  subscribeToConnected,
} from './connection'
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

subscribeToAuthChanges(authState => {
  setAccessToken(authState ? authState.accessToken : null)
})

export const BackendProvider = ({ children }) => <ApolloProvider client={apolloClient} children={children} />

type MetadataKey = '_id' | '_versionId' | '_versionNumber' | '_updatedAt'
type MetadataObject = Partial<Record<MetadataKey, unknown>>

export function cleanMetadataValues<T extends MetadataObject>(value: MetadataObject): Omit<T, MetadataKey> {
  const { _id, _versionId, _versionNumber, _updatedAt, ...rest } = value
  return rest as Omit<T, MetadataKey>
}
