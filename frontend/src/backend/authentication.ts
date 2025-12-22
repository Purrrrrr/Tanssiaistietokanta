import { Socket } from 'socket.io-client'

import { AuthResponse, AuthState } from './authentication/state'
import { authRequest, debug, msUntilTokenExpires, RefreshScheduler } from './authentication/utils'

const refreshScheduler = new RefreshScheduler()
const authState = new AuthState()
authState.on('change', (state) => {
  if (state === null) {
    refreshScheduler.clearRefresh()
    return
  }

  const { authentication, accessToken } = state
  const timeout = msUntilTokenExpires(authentication.payload.exp) - 60000
  refreshScheduler.scheduleRefresh(() => auth('jwt', { accessToken }), timeout)
})

export function getCurrentUser() {
  return authState.currentUser
}

export function getCurrentAccessToken() {
  return authState.currentAccessToken
}

export function subscribeToAuthChanges(callback: (state: AuthResponse | null) => unknown) {
  authState.on('change', callback)
  return () => {
    authState.off('change', callback)
  }
}

let initializing = false
export async function initializeAuthentication() {
  if (authState.initialized) {
    return
  }
  if (initializing) {
    await authState.waitForInitialization()
    return
  }
  initializing = true
  await auth('refreshToken')
}

export async function login(username: string, password: string) {
  return auth('local', { email: username, password })
}

async function auth(strategy: string, body?: Record<string, unknown>) {
  refreshScheduler.clearRefresh()
  debug('Authenticating with strategy: %s', strategy)
  const response = await authRequest('POST', { strategy, ...body })

  if (!response.ok) {
    debug('Authentication failed with status: %d', response.status)
    authState.setState(null)
    return null
  }
  const result = await response.json() as AuthResponse
  debug('Authentication succeeded for user: %O', result.user)
  authState.setState(result)
  return result.user
}

export async function logout() {
  refreshScheduler.clearRefresh()
  debug('Logging out user')
  await authRequest('DELETE', undefined, {
    Authorization: `Bearer ${authState.currentAccessToken}`,
  })
  authState.setState(null)
}

export function setSocketAuthToken(socket: Socket, accessToken: string | null) {
  if (accessToken === null) {
    socket.emit('remove', 'authentication', accessToken)
  } else {
    socket.emit('create', 'authentication', { strategy: 'jwt', accessToken })
  }
}
