import { useMutation as useMutationOriginal, useQuery, FetchResult, MutationResult } from "@apollo/client";
import {showDefaultErrorToast} from "utils/toaster"

export function useMutation(query, options = {}) {
  return useMutationOriginal(query, {
    onError: showDefaultErrorToast,
    ...options
  })
}

export function makeListQueryHook(query, dataKey) {
  return () => {
    const result = useQuery(query);
    return [result.data ? result.data[dataKey] : [], result];
  }
}

export function makeMutationHook<V extends any[]>(
  query,
  {
    parameterMapper,
    ...rest
  } : {
    parameterMapper: (...V) => object,
    [key : string]: any
  }
) {
  return (args = {}) : [(...vars: V) => Promise<FetchResult>, MutationResult<any>] => {
    const [runQuery, data] = useMutation(query, {...args, ...rest});

    return [
      (...vars : V) => runQuery(parameterMapper(...vars)),
      data
    ];
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
