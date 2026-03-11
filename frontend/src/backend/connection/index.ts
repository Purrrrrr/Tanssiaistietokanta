import io from 'socket.io-client'

import { RestResult } from './types'

import { backendHost, backendPath, debug } from './constants'
import { fetchRequest } from './fetch'
import { fetchWithProgress, FetchWithProgressOptions, Method } from './fetchWithProgress'

export const socket = io(backendHost, { path: `${backendPath}/socket.io` })

let accessToken: string | null = null

export async function setAccessToken(token: string | null) {
  if (token === accessToken) return
  debug('Setting backend connection accessToken')

  if (socket.connected) {
    await setSocketAccessToken(token)
  }
  accessToken = token
}

socket.on('connect', () => {
  if (accessToken) {
    setSocketAccessToken(accessToken)
  }
})

export async function socketRequest<T>(
  service: string,
  verb: 'find' | 'create' | 'remove',
  query?: unknown,
) {
  return new Promise<T>((resolve, reject) =>
    socket.emit(verb, service, query, (err: unknown, res: T) => err ? reject(err) : resolve(res)),
  )
}

function setSocketAccessToken(accessToken: string | null) {
  if (accessToken === null) {
    debug('Removing socket accessToken')
    return socketRequest('authentication', 'remove')
  } else {
    debug('Setting socket accessToken')
    return socketRequest('authentication', 'create', { strategy: 'jwt', accessToken })
  }
}

export function subscribeToConnected(callback: () => void) {
  socket.on('connect', callback)
  socket.on('disconnect', callback)

  return () => {
    socket.off('connect', callback)
    socket.off('disconnect', callback)
  }
}
export function isConnected() {
  return socket.connected
}

export function restRequest<T>(
  url: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<RestResult<T, string>> {
  return fetchRequest(url, method, body, accessToken)
}

export function restRequestWithProgress(
  method: Method,
  url: string,
  options: Omit<FetchWithProgressOptions, 'accessToken'>,
): Promise<RestResult<string, 'aborted' | 'unknown'>> {
  return fetchWithProgress(url, method, { ...options, accessToken })
}

export type RestRequestWithProgressOptions = FetchWithProgressOptions
export type { FetchRequestProgress } from './fetchWithProgress'
