import { gql, useMutation, FetchResult, MutationResult } from './apollo'

interface MutationQueryArgs {
  onCompleted ?: (data: Record<string, unknown>) => unknown
  refetchQueries?: string[]
}

export function makeMutationHook<V extends unknown[]>(
  query,
  {
    onCompleted,
    parameterMapper = (args) => args,
    ...rest
  } : {
    onCompleted ?: (a: Record<string, unknown>) => unknown,
    parameterMapper?: (...V) => object,
    [key : string]: unknown
  }
) {
  const compiledQuery = gql(query)

  return (args : MutationQueryArgs = {}) : [(...vars: V) => Promise<FetchResult>, MutationResult<unknown>] => {
    const options = {
      ...args,
      ...rest,
      onCompleted: (data) => {
        if (onCompleted) onCompleted(data)
        if (args.onCompleted) args.onCompleted(data)
      }
    }
    const [runQuery, data] = useMutation(compiledQuery, options)

    return [
      (...vars : V) => runQuery(parameterMapper(...vars)),
      data
    ]
  }
}

export function getSingleValue(obj) {
  return obj[getSingleKey(obj)]
}

export function getSingleKey(obj) {
  const keys = Object.keys(obj)
  if (keys.length !== 1) {
    const keysStr = keys.join(',')
    throw new Error(`Expected object to have one key, found ${keysStr}`)
  }

  return keys[0]
}
