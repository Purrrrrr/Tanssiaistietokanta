import { MutationHookOptions, OperationVariables, QueryHookOptions, QueryResult } from '@apollo/client'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'

import { Entity, ServiceName } from './types'

import {showErrorToast} from 'libraries/ui'
import { useTranslation } from 'i18n'

import { apolloClient, ApolloProvider, FetchResult, MutationResult, useMutation, useQuery } from './apollo'
import { appendToListQuery, filterRemovedFromListQuery } from './apolloCache'
import { getSingleValue, ValueOf } from './apolloUtils'
import { emitServiceEvent, EventName, useServiceListEvents } from './serviceEvents'

export { updateEntityFragment } from './apolloCache'
export { setupServiceUpdateFragment, useServiceEvents } from './serviceEvents'
export { graphql } from 'types/gql'

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

export function entityListQueryHook<T extends {[k in number]: Entity[]}, V extends OperationVariables>(
  service : ServiceName, compiledQuery: TypedDocumentNode<T, V>
): () => [
  ValueOf<T>,
  QueryResult<T, V>
] {
  const callbacks = {
    created: (data) => appendToListQuery(compiledQuery, data),
    updated: () => { /* do nothing */ },
    removed: () => filterRemovedFromListQuery(compiledQuery),
  }

  return () => {
    //TODO: type this
    useServiceListEvents(service, callbacks)

    const result = useQuery<T, V>(compiledQuery, { fetchPolicy: 'cache-and-network' })
    const empty = [] as ValueOf<T>
    const data = result.data !== undefined
      ? getSingleValue(result.data)
      : empty

    return [
      data, result
    ]
  }
}

export function entityCreateHook<T, V>(
  service: ServiceName, query: TypedDocumentNode<T, V>, options = {}
) {
  return makeMutationHook<T, V>(query, {
    ...options,
    fireEvent: [service, 'created'],
  })
}

export function entityUpdateHook<T, V>(
  service: ServiceName, query: TypedDocumentNode<T, V>, options = {}
) {
  return makeMutationHook<T, V>(query, {
    ...options,
    fireEvent: [service, 'updated'],
  })
}

export function entityDeleteHook<T, V>(
  service: ServiceName, query: TypedDocumentNode<T, V>, options = {}
) {
  return makeMutationHook<T, V>(query, {
    ...options,
    fireEvent: [service, 'removed'],
  })
}

interface MutateHookOptions<T, V> extends MutationHookOptions<T, V> {
  fireEvent?: [ServiceName, EventName]
}

export function makeMutationHook<T, V>(
  query: TypedDocumentNode<T, V>,
  options?: MutateHookOptions<T, V>,
): (args?: MutationHookOptions<T, V>) => [(vars: V) => Promise<FetchResult<T>>, MutationResult<T>] {
  const { onCompleted, fireEvent } = options ?? {}
  return (args = {}) => {
    const operationFailed = useTranslation('common.operationFailed')
    const options : MutationHookOptions<T, V> = {
      onError: err => { showErrorToast(operationFailed, err) },
      ...args,
      onCompleted: (data) => {
        if (fireEvent) {
          const [service, eventName] = fireEvent
          const value = getSingleValue(data as object)
          emitServiceEvent(service, eventName, value)
        }
        if (onCompleted) onCompleted(data)
        if (args.onCompleted) args.onCompleted(data)
      }
    }
    const [runQuery, data] = useMutation<T, V>(query, options)

    return [
      (variables) => runQuery({variables}),
      data
    ]
  }
}

export function backendQueryHook<T, V extends OperationVariables>(
  query: TypedDocumentNode<T, V>,
  additionalCode?: (res: QueryResult<T, V>) => unknown,
): ((v: V, o?: QueryHookOptions<T, V>) => QueryResult<T, V>) {
  return (variables: V, options: QueryHookOptions<T, V> = {}) => {
    const queryResult = useQuery<T, V>(query, { variables, fetchPolicy: 'cache-and-network', ...options })
    if (additionalCode) additionalCode(queryResult)
    return queryResult
  }
}

type MetadataKey = '_id' | '_versionId' | '_versionNumber' | '_updatedAt'
type MetadataObject = Partial<Record<MetadataKey, unknown>>

export function cleanMetadataValues<T extends MetadataObject>(value: MetadataObject): Omit<T, MetadataKey> {
  const { _id, _versionId, _versionNumber, _updatedAt, ...rest } = value
  return rest as Omit<T, MetadataKey>
}
