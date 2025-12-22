import { Socket } from 'socket.io-client'

import { AuthResponse } from './types'

import { backendUrl } from '../constants'
import { debug } from './utils'

export async function loginRequest(request: { strategy: string, [key: string]: unknown }) {
  debug('Authenticating with strategy: %s', request.strategy)
  const response = await authRequest('POST', request)

  if (!response.ok) {
    debug('Authentication failed with status: %d', response.status)
    return null
  }

  const result = await response.json() as AuthResponse
  debug('Authentication succeeded for user: %O', result.user)
  return result
}

export function logoutRequest(accessToken: string) {
  debug('Logging out user')
  return authRequest('DELETE', undefined, {
    Authorization: `Bearer ${accessToken}`,
  })
}

export function authRequest(method: string, body?: Record<string, unknown>, headers?: Record<string, string>) {
  return fetch(
    `${backendUrl}/authentication`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  )
}

export function setSocketAuthToken(socket: Socket, accessToken: string | null) {
  if (accessToken === null) {
    debug('Removing socket accessToken')
    socket.emit('remove', 'authentication', accessToken)
  } else {
    debug('Setting socket accessToken')
    socket.emit('create', 'authentication', { strategy: 'jwt', accessToken })
  }
}
