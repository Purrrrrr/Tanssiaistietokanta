import { AuthResponse } from './types'

import { restRequest } from 'backend/connection'

import { AuthState } from './state'
import { debug, RefreshScheduler } from './utils'

export type { User } from './types'

const loggedInCookieName = 'danceOrganizerLoggedIn'

const refreshScheduler = new RefreshScheduler(refreshAuth)
function refreshAuth() {
  return refreshScheduler.hasExpired()
    ? auth('refreshToken')
    : auth('jwt', { accessToken: authState.currentAccessToken })
}

const authState = new AuthState()
authState.on('change', (state) => {
  if (state === null) {
    refreshScheduler.expire()
    return
  }

  refreshScheduler.scheduleRefresh(state.authentication.payload.exp)
})

authState.on('initialize', () => {
  const isLoggedIn = document.cookie.split('; ')
    .find((cookie) => cookie === `${loggedInCookieName}=yes`)

  if (isLoggedIn) auth('refreshToken')
  else authState.setState(null)
})

export const initializeAuthentication = () => authState.initialize()

export function getCurrentUser() {
  return authState.currentUser
}

export function subscribeToAuthChanges(callback: (state: AuthResponse | null) => unknown) {
  authState.on('change', callback)
  return () => { authState.off('change', callback) }
}

export function login(username: string, password: string) {
  return auth('local', { username, password })
}

export async function logout() {
  const token = authState.currentAccessToken
  if (token === null) return

  refreshScheduler.clearRefresh()
  debug('Logging out user')
  await restRequest('authentication', 'DELETE')
  authState.setState(null)
}

async function auth(strategy: string, body?: Record<string, unknown>) {
  refreshScheduler.clearRefresh()
  debug('Authenticating with strategy: %s', strategy)
  const response = await restRequest<AuthResponse>('authentication', 'POST', { strategy, ...body })

  if (response.type !== 'ok') {
    debug('Authentication failed with status: %d', response.status)
    return null
  }
  const result = response.data
  debug('Authentication succeeded for user: %O', result.user)

  authState.setState(result)
  return result?.user
}
