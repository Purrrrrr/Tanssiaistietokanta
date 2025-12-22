import { AuthResponse } from './types'

import { loginRequest, logoutRequest } from './requests'
import { AuthState } from './state'
import { RefreshScheduler } from './utils'

export { setSocketAuthToken } from './requests'

const refreshScheduler = new RefreshScheduler(refreshAuth)
const authState = new AuthState()
authState.on('change', (state) => {
  if (state === null) {
    refreshScheduler.expire()
    return
  }

  refreshScheduler.scheduleRefresh(state.authentication.payload.exp)
})
authState.on('initialize', () => auth('refreshToken'))

export const initializeAuthentication = () => authState.initialize()

export function getCurrentUser() {
  return authState.currentUser
}

export function getCurrentAccessToken() {
  return authState.currentAccessToken
}

export function subscribeToAuthChanges(callback: (state: AuthResponse | null) => unknown) {
  authState.on('change', callback)
  return () => { authState.off('change', callback) }
}

export function refreshAuth() {
  return refreshScheduler.hasExpired()
    ? auth('refreshToken')
    : auth('jwt', { accessToken: authState.currentAccessToken })
}

export function login(username: string, password: string) {
  return auth('local', { email: username, password })
}

async function auth(strategy: string, body?: Record<string, unknown>) {
  refreshScheduler.clearRefresh()
  const result = await loginRequest({ strategy, ...body })

  authState.setState(result)
  return result?.user
}

export async function logout() {
  const token = authState.currentAccessToken
  if (token === null) return

  refreshScheduler.clearRefresh()
  await logoutRequest(token)
  authState.setState(null)
}
