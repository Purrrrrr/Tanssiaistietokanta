import { ApolloClient, ApolloLink, InMemoryCache, Observable, useMutation as useMutationOriginal } from '@apollo/client'
import {runGraphQlQuery} from './feathers'
import {showDefaultErrorToast} from 'utils/toaster'

export {gql, ApolloProvider, useQuery} from '@apollo/client'
export {ApolloClient}
export type {DocumentNode, FetchResult, MutationResult} from '@apollo/client'

const cache = new InMemoryCache({
  possibleTypes: {
    EventProgramItem: ['RequestedDance', 'Dance', 'EventProgram'],
    ProgramItem: ['Dance', 'EventProgram'],
  },
  typePolicies: {
    Query: {
      fields: {
        // We always accept the incoming data to the cache since it's not paginated or filtered
        dances: {
          merge: (_, incoming) => incoming
        },
        events: {
          merge: (_, incoming) => incoming
        },
      }
    }
  }
})

const socketLink = new ApolloLink((operation) => {
  const {query, variables} = operation
  return observableFromPromise(
    runGraphQlQuery({query, variables})
  )
})

function observableFromPromise<T>(promise : Promise<T>) : Observable<T> {
  return new Observable(observer => {
    async function run() {
      const result = await promise
      if ('errors' in result) {
        const error = (result as {errors: unknown[]}).errors[0]
        observer.error(error)
        console.error(error)
      }
      observer.next(await promise)
    }
    run().then(() => observer.complete(), e => observer.error(e))
  })
}

export const apolloClient = new ApolloClient({
  link: socketLink,
  cache,
})

export function useMutation(query, options = {}) {
  return useMutationOriginal(query, {
    onError: err => { showDefaultErrorToast(err)},
    ...options
  })
}
