import ApolloClient from 'apollo-boost';

export const apolloClient = new ApolloClient({ });
export { ApolloProvider, useQuery, useMutation } from '@apollo/react-hooks';
export { gql } from 'apollo-boost';
