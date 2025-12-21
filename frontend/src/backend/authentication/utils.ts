import createDebug from 'utils/debug'

import { backendUrl } from '../constants'

export const debug = createDebug('auth')

export class RefreshScheduler {
  private timeoutId: number | null = null

  scheduleRefresh(callback: () => void, delayMs: number) {
    this.clearRefresh()
    debug('Scheduling token refresh in %d ms', delayMs)
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null
      callback()
    }, delayMs)
  }

  clearRefresh() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}

export function msUntilTokenExpires(exp: number) {
  const nowMs = Date.now()
  const expMs = exp * 1000
  return Math.max(expMs - nowMs, 0)
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
