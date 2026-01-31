import { FetchResult } from '@apollo/client'
import { print } from 'graphql'
import io from 'socket.io-client'

import { ServiceName } from './types'

import createDebug from 'utils/debug'

import { getCurrentAccessToken, initializeAuthentication, setSocketAuthToken, subscribeToAuthChanges } from './authentication'
import { backendHost, backendPath } from './constants'

const debug = createDebug('graphql')

export const socket = io(backendHost, { path: `${backendPath}/socket.io` })

export async function makeFeathersRequest<T>(
  service: ServiceName | 'channel-connections' | 'graphql' | 'authentication',
  verb: 'find' | 'create' | 'remove',
  query: unknown,
) {
  await initializeAuthentication()
  return new Promise<T>((resolve, reject) =>
    socket.emit(verb, service, query, (err: unknown, res: T) => err ? reject(err) : resolve(res)),
  )
}

let socketLoggedIn = false
subscribeToAuthChanges(authState => {
  if (!socket.connected) return

  const shouldSetState = (authState !== null) !== socketLoggedIn
  if (shouldSetState) {
    setSocketAuthToken(socket, authState ? authState.accessToken : null)
  }
  socketLoggedIn = authState !== null
})
socket.on('connect', () => {
  const accessToken = getCurrentAccessToken()
  socketLoggedIn = accessToken !== null
  if (accessToken) {
    setSocketAuthToken(socket, accessToken)
  }
})
socket.on('disconnect', () => {
  socketLoggedIn = false
})

type R = FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>

export async function runGraphQlQuery({ query, variables }): Promise<FetchResult<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>> {
  debug('GraphQL query: %s\nVariables: %O', print(query), variables)
  const result = await makeFeathersRequest<R>('graphql', 'find', { query, variables })
  if (debug.enabled) {
    Object.keys(result).forEach(
      key => Object.keys(result[key]).forEach(
        dataKey => debug('%s.%s: %O', key, dataKey, result[key][dataKey]),
      ),
    )
  }
  return result
}
