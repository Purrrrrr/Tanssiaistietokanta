import {useMutation as useMutationOriginal, useQuery} from '@apollo/react-hooks';
import {MutationResult, ExecutionResult} from '@apollo/react-common';

import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import {showDefaultErrorToast} from "utils/toaster"

export {ApolloProvider, useQuery} from '@apollo/react-hooks';
export {gql} from 'apollo-boost';
export {ApolloClient};
export function useMutation(query, options = {}) {
  return useMutationOriginal(query, {
    onError: showDefaultErrorToast,
    ...options
  })
}

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          "kind": "UNION",
          "name": "EventProgramItem",
          "possibleTypes": [
            {
              "name": "RequestedDance"
            },
            {
              "name": "Dance"
            },
            {
              "name": "OtherProgram"
            }
          ]
        },{
          "kind": "INTERFACE",
          "name": "NamedProgram",
          "possibleTypes": [
            {
              "name": "Dance"
            },
            {
              "name": "OtherProgram"
            }
          ]
        }
      ]
    }
  }
});
const cache = new InMemoryCache({fragmentMatcher});

export const apolloClient = new ApolloClient({ cache });

export function makeFragmentCache(type, query) {
  return id => apolloClient.readFragment({
    id: type+":"+id,
    fragment: query,
  });
}

export function makeListQueryHook(query, dataKey) {
  return () => {
    const result = useQuery(query);
    return [result.data ? result.data[dataKey] : [], result];
  }
}

export function makeMutationHook<V extends any[]>(
  query, {parameterMapper, ...rest} : {parameterMapper: (...V) => object, [key : string]: any}
) {
  return (args = {}) : [(...vars: V) => Promise<ExecutionResult<any>>, MutationResult<any>] => {
    const [runQuery, data] = useMutation(query, {...args, ...rest});

    return [(...vars : V) => runQuery(parameterMapper(...vars)), data];
  };
}

export function appendToListQuery(cache, query, newValue) {
  updateQuery(cache, query, data => {
    for (const key in data) {
      return {
        [key]: [...data[key], newValue]
      }
    }
  });
}

export function updateQuery(cache, query, updater) {
  const data = cache.readQuery({query});
  cache.writeQuery({
    query,
    data: updater(data)
  });
}
