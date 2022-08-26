import React  from 'react';
import { ServiceName } from './backend/types'
import { apolloClient, ApolloProvider, useQuery, gql } from './backend/apollo'
import { makeMutationHook, getSingleValue } from './backend/apolloUtils'
import { appendToListQuery, filterRemovedFromListQuery } from './backend/apolloCache'
import { EventName, emitServiceEvent, useServiceListEvents } from './backend/serviceEvents'

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

interface MutateHookOptions {
  fireEvent ?: EventName
  onCompleted ?: Function
}

function serviceMutateHook(
  service : ServiceName,
  query : string, 
  {
    fireEvent = undefined,
    onCompleted = undefined,
    ...options
  } : MutateHookOptions = {}
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

interface QueryOptions {
}

export function backendQueryHook(
  query : string,
  options : QueryOptions = {},
) {
  const compiledQuery = gql(query)
  return (variables = {}, options = {}) => useQuery(compiledQuery, { variables, ...options })
}
