import { FetchResult } from '@apollo/client'
import { print } from 'graphql'

import createDebug from 'utils/debug'

import { initializeAuthentication, subscribeToAuthChanges } from './authentication'
import { setAccessToken, socketRequest } from './connection'

const debug = createDebug('graphql')

subscribeToAuthChanges(authState => {
  setAccessToken(authState ? authState.accessToken : null)
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
