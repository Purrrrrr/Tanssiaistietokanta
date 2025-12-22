import createDebug from 'utils/debug'

export const debug = createDebug('auth')

const MINUTE = 60 * 1000
const MAX_DELAY = 10 * MINUTE
const REFRESH_MARGIN = MINUTE

export class RefreshScheduler {
  private timeoutId: number | null = null
  private tokenExpiry: number = 0

  constructor(public callback: () => void) {}

  scheduleRefresh(expiry: number) {
    this.clearRefresh()

    this.tokenExpiry = expiry
    const scheduledDelay = Math.min(MAX_DELAY, (msUntilTokenExpires(expiry) - REFRESH_MARGIN))
    debug('Scheduling token refresh in %d ms', scheduledDelay)
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null
      this.callback()
    }, scheduledDelay)
  }

  clearRefresh() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
      this.tokenExpiry = 0
    }
  }

  hasExpired() {
    return msUntilTokenExpires(this.tokenExpiry) <= 0
  }
}

export function msUntilTokenExpires(exp: number) {
  const nowMs = Date.now()
  const expMs = exp * 1000
  return Math.max(expMs - nowMs, 0)
}
