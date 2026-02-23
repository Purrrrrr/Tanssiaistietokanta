import { ApolloClient, ApolloLink, FetchResult, InMemoryCache, Observable } from '@apollo/client'
import { print } from 'graphql'

import createDebug from 'utils/debug'

import { initializeAuthentication } from './authentication'
import { socketRequest } from './connection'

export { ApolloProvider, gql, useMutation, useQuery } from '@apollo/client'
export { ApolloClient }
export type { DocumentNode, FetchResult, MutationResult } from '@apollo/client'

const debug = createDebug('graphql')

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // We always accept the incoming data to the cache since it's not paginated or filtered
        dances: {
          merge: (_, incoming) => incoming,
        },
        events: {
          merge: (_, incoming) => incoming,
        },
      },
    },
    Event: {
      keyFields: ['_id', '_versionId'],
    },
  },
})

const socketLink = new ApolloLink((operation) => {
  const { query, variables } = operation
  return observableFromPromise(
    runGraphQlQuery({ query, variables }),
  )
})

export const apolloClient = new ApolloClient({
  link: socketLink,
  cache,
})

type R = FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>

export async function runGraphQlQuery({ query, variables }): Promise<FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>> {
  debug('GraphQL query: %s\nVariables: %O', print(query), variables)
  await initializeAuthentication()
  const result = await socketRequest<R>('graphql', 'find', { query, variables })
  if (debug.enabled) {
    Object.keys(result).forEach(
      key => Object.keys(result[key]).forEach(
        dataKey => debug('%s.%s: %O', key, dataKey, result[key][dataKey]),
      ),
    )
  }
  return result
}

function observableFromPromise<T>(promise: Promise<T>): Observable<T> {
  return new Observable(observer => {
    async function run() {
      const result = await promise
      if (result !== null && typeof result === 'object' && 'errors' in result) {
        const error = (result as { errors: unknown[] }).errors[0]
        observer.error(error)
        console.error(error)
      }
      observer.next(await promise)
    }
    run().then(() => observer.complete(), e => observer.error(e))
  })
}
