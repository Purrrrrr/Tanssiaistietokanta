import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client";
import {runGraphQlQuery} from './feathers';

export {gql, ApolloProvider, useQuery} from "@apollo/client"
export {ApolloClient};

const cache = new InMemoryCache({
  possibleTypes: {
    EventProgramItem: ['RequestedDance', 'Dance', 'EventProgram'],
    ProgramItem: ['Dance', 'EventProgram'],
  }
});

const socketLink = new ApolloLink((operation) => {
  const {query, variables} = operation
  return observableFromPromise(
    runGraphQlQuery({query, variables})
  )
})

function observableFromPromise<T>(promise : Promise<T>) : Observable<T> {
  return new Observable(observer => {
    async function run() {
      observer.next(await promise);
    }
    run().then(() => observer.complete(), e => observer.error(e));
  });
}

export const apolloClient = new ApolloClient({
  link: socketLink,
  cache,
});
