import React  from 'react';
import feathers from './backend/feathers'
import { apolloClient, ApolloProvider, useQuery, gql, getApolloCache } from './backend/apollo'
import { ServiceName } from './backend/serviceEvents'
import { makeMutationHook, appendToListQuery, getSingleKey, getSingleValue } from './backend/apolloUtils'
import { emitServiceEvent, useServiceListEvents, isExistingEntity } from './backend/serviceEvents'

export { ApolloClient, useQuery, gql } from './backend/apollo'
export { useMutation, makeListQueryHook, makeMutationHook, appendToListQuery } from './backend/apolloUtils'
export { feathers }
export { setupServiceUpdateFragment } from './backend/serviceEvents'

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

export function entityListQueryHook(service : ServiceName, query) {
  const compiledQuery = gql(query)
  const cache = getApolloCache()
  const callbacks = {
    created: (data) => {
      appendToListQuery(cache, compiledQuery, data)
    },
    updated: () => {
    },
    removed: () => {
      cache.updateQuery({ query: compiledQuery }, data => {
        const key = getSingleKey(data)
        return {
          [key]: data[key].filter(isExistingEntity)
        }
      })
    },
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
