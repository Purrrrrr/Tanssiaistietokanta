import React  from 'react'
import { QueryHookOptions, QueryResult } from '@apollo/client'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'

import {showDefaultErrorToast} from 'utils/toaster'

import { Entity, ServiceName } from './types'

import { apolloClient, ApolloProvider, FetchResult, MutationResult, useMutation, useQuery } from './apollo'
import { appendToListQuery, filterRemovedFromListQuery } from './apolloCache'
import { getSingleValue, ValueOf } from './apolloUtils'
import { emitServiceEvent, EventName, useServiceListEvents } from './serviceEvents'

export { updateEntityFragment } from './apolloCache'
export { setupServiceUpdateFragment } from './serviceEvents'
export { graphql } from 'types/gql'

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

export function entityListQueryHook<T extends {[k in number]: Entity[]}, V>(
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
  return serviceMutateHook<T, V>(service, query, {
    ...options,
    fireEvent: 'created',
  })
}

export function entityUpdateHook<T, V>(
  service: ServiceName, query: TypedDocumentNode<T, V>, options = {}
) {
  return serviceMutateHook<T, V>(service, query, {
    ...options,
    fireEvent: 'updated',
  })
}

export function entityDeleteHook<T, V>(
  service: ServiceName, query: TypedDocumentNode<T, V>, options = {}
) {
  return serviceMutateHook<T, V>(service, query, {
    ...options,
    fireEvent: 'removed',
  })
}

interface MutateHookOptions<T> {
  fireEvent ?: EventName
  onCompleted ?: (d: {data?: T}) => unknown
}

function serviceMutateHook<T, V>(
  service: ServiceName,
  query: TypedDocumentNode<T, V>,
  {
    fireEvent = undefined,
    onCompleted = undefined,
    ...options
  }: MutateHookOptions<T>
) {
  return makeMutationHook(query, {
    ...options,
    onCompleted: (data) => {
      if (fireEvent) {
        const value = getSingleValue(data)
        emitServiceEvent(service, fireEvent, value)
      }
      if (onCompleted) onCompleted(data)
    },
  })
}

interface MutationQueryArgs<T> {
  onCompleted ?: (data: T) => unknown
  refetchQueries?: string[]
}

export function makeMutationHook<T, V>(
  query: TypedDocumentNode<T, V>,
  options?: {
    onCompleted?: (a: Record<string, unknown>) => unknown,
  }
): (args?: MutationQueryArgs<T>) => [(vars: V) => Promise<FetchResult<T>>, MutationResult<T>] {
  const { onCompleted } = options ?? {}
  return (args = {}) => {
    const options = {
      onError: err => { showDefaultErrorToast(err)},
      ...args,
      onCompleted: (data) => {
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

export function backendQueryHook<T, V>(
  query: TypedDocumentNode<T, V>
): ((v: V, o?: QueryHookOptions<T, V>) => QueryResult<T, V>) {
  return (variables: V, options: QueryHookOptions<T, V> = {}) => {
    return useQuery<T, V>(query, { variables, fetchPolicy: 'cache-and-network', ...options })
  }
}
