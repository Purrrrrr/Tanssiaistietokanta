import React  from 'react';
import { ServiceName } from './backend/types'
import { apolloClient, ApolloProvider, useQuery, gql } from './backend/apollo'
import { makeMutationHook, getSingleValue } from './backend/apolloUtils'
import { appendToListQuery, filterRemovedFromListQuery } from './backend/apolloCache'
import { emitServiceEvent, useServiceListEvents } from './backend/serviceEvents'

export { useQuery, gql } from './backend/apollo'
export { setupServiceUpdateFragment } from './backend/serviceEvents'

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

export function entityListQueryHook(service : ServiceName, query) {
  const compiledQuery = gql(query)
  const callbacks = {
    created: (data) => appendToListQuery(compiledQuery, data),
    updated: () => { },
    removed: () => filterRemovedFromListQuery(compiledQuery),
  }

  return () => {
    useServiceListEvents(service, callbacks)

    const result = useQuery(compiledQuery);
    const data = result.data ? getSingleValue(result.data) : []

    return [
      data, result
    ];
  }
}

export function entityCreateHook(service : ServiceName, query : string, options = {}) {
  return makeMutationHook(query, {
    ...options,
    onCompleted: (data) => {
      const value = getSingleValue(data)
      emitServiceEvent(service, 'created', value)
      // @ts-ignore
      if (options.onCompleted) options.onCompleted(data)
    },
  })
}

export function entityUpdateHook(service : ServiceName, query : string, options = {}) {
  return makeMutationHook(query, {
    ...options,
    onCompleted: (data) => {
      const value = getSingleValue(data)
      emitServiceEvent(service, 'updated', value)
      // @ts-ignore
      if (options.onCompleted) options.onCompleted(data)
    },
  })
}

export function entityDeleteHook(service : ServiceName, query : string, options = {}) {
  return makeMutationHook(query, {
    ...options,
    onCompleted: (data) => {
      const value = getSingleValue(data)
      emitServiceEvent(service, 'removed', value)
      // @ts-ignore
      if (options.onCompleted) options.onCompleted(data)
    },
  })
}

interface QueryOptions {
}

export function backendQueryHook(
  query : string,
  options : QueryOptions = {},
) {
  const compiledQuery = gql(query)
  return (variables = {}, options = {}) => useQuery(compiledQuery, { variables, ...options })
}
