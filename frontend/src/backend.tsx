import React  from 'react'
import { ServiceName } from './backend/types'
import { apolloClient, ApolloProvider, useQuery, gql } from './backend/apollo'
import { makeMutationHook, getSingleValue } from './backend/apolloUtils'
import { appendToListQuery, filterRemovedFromListQuery } from './backend/apolloCache'
import { EventName, emitServiceEvent, useServiceListEvents } from './backend/serviceEvents'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { QueryHookOptions, QueryResult } from '@apollo/client'

export { setupServiceUpdateFragment } from './backend/serviceEvents'
export { updateEntityFragment } from './backend/apolloCache'
export { graphql } from 'types/gql'

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

export function entityListQueryHook(service : ServiceName, query) {
  const compiledQuery = gql(query)
  const callbacks = {
    created: (data) => appendToListQuery(compiledQuery, data),
    updated: () => { /* do nothing */ },
    removed: () => filterRemovedFromListQuery(compiledQuery),
  }

  return () => {
    useServiceListEvents(service, callbacks)

    const result = useQuery(compiledQuery)
    const data = result.data ? getSingleValue(result.data) : []

    return [
      data, result
    ]
  }
}

export function entityCreateHook(service : ServiceName, query : string, options = {}) {
  return serviceMutateHook(service, query, {
    ...options,
    fireEvent: 'created',
  })
}

export function entityUpdateHook(service : ServiceName, query : string, options = {}) {
  return serviceMutateHook(service, query, {
    ...options,
    fireEvent: 'updated',
  })
}

export function entityDeleteHook(service : ServiceName, query : string, options = {}) {
  return serviceMutateHook(service, query, {
    ...options,
    fireEvent: 'removed',
  })
}

interface MutateHookOptions<T> {
  fireEvent ?: EventName
  onCompleted ?: (d: {data?: T}) => unknown
}

function serviceMutateHook<T = unknown>(
  service : ServiceName,
  query : string,
  {
    fireEvent = undefined,
    onCompleted = undefined,
    ...options
  } : MutateHookOptions<T> = {}
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

export function backendQueryHook<T, V>(
  query: TypedDocumentNode<T, V>
): ((v: V, o?: QueryHookOptions<T, V>) => QueryResult<T, V>) {
  return (variables: V, options: QueryHookOptions<T, V> = {}) => {
    return useQuery<T, V>(query, { variables, ...options })
  }
}
