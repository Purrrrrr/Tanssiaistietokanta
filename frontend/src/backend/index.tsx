import { useEffect, useState } from 'react'

import { apolloClient, ApolloProvider } from './apollo'
import { initializeAuthentication, subscribeToAuthChanges } from './authentication'
import { setAccessToken } from './connection'
import { GlobalLoadingState } from './GlobalLoadingState'

export { updateEntityFragment } from './apolloCache'
export { type FetchRequestProgress, restRequestWithProgress, type RestRequestWithProgressOptions, socketRequest } from './connection'
export { addGlobalLoadingAnimation, lazyLoadComponent, useShowGlobalLoadingAnimation } from './GlobalLoadingState'
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

export const BackendProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    initializeAuthentication().then(() => setInitialized(true))
  }, [])

  return <ApolloProvider client={apolloClient}>
    <GlobalLoadingState appInitialized={initialized}>
      {initialized && children}
    </GlobalLoadingState>
  </ApolloProvider>
}

type MetadataKey = '_id' | '_versionId' | '_versionNumber' | '_updatedAt'
type MetadataObject = Partial<Record<MetadataKey, unknown>>

export function cleanMetadataValues<T extends MetadataObject>(value: MetadataObject): Omit<T, MetadataKey> {
  const { _id, _versionId, _versionNumber, _updatedAt, ...rest } = value
  return rest as Omit<T, MetadataKey>
}
