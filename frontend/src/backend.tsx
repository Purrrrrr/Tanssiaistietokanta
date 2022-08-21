import React from 'react';
import feathers from './backend/feathers'
import { apolloClient, ApolloProvider, useQuery, gql } from './backend/apollo'

export { ApolloClient, useQuery, gql } from './backend/apollo'
export { useMutation, makeListQueryHook, makeMutationHook, appendToListQuery, updateQuery } from './backend/apolloUtils'
export { feathers }

export const BackendProvider = ({children}) => <ApolloProvider client={apolloClient} children={children} />

interface QueryOptions {
}

export function backendQueryHook(
  query : string,
  options : QueryOptions = {},
) {
  const compiledQuery = gql(query)

  return (variables = {}, options = {}) => useQuery(compiledQuery, { variables, ...options })
}
