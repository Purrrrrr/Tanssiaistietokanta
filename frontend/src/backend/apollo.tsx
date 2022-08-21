import { ApolloClient, InMemoryCache } from "@apollo/client";

export {gql, ApolloProvider, useQuery} from "@apollo/client"
export {ApolloClient};

const cache = new InMemoryCache({
  possibleTypes: {
    EventProgramItem: ['RequestedDance', 'Dance', 'EventProgram'],
    ProgramItem: ['Dance', 'EventProgram'],
  }
});
const uri = '/api/graphql'

export const apolloClient = new ApolloClient({
  uri,
  cache,
});
