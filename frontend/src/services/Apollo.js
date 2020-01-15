import {useMutation as useMutationOriginal, useQuery} from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
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

export const apolloClient = new ApolloClient({});

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

export function makeMutationHook(query, {parameterMapper, ...rest}) {
  return args => {
    const [runQuery, data] = useMutation(query, {args, ...rest});

    return [(...vars) => runQuery(parameterMapper(...vars)), data];
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
