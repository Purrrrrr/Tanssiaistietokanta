import createDebug from 'utils/debug'

export const debug = createDebug('auth')

const MINUTE = 60 * 1000
const MAX_DELAY = 10 * MINUTE
const REFRESH_MARGIN = MINUTE
const MINIMUM_TIME_BETWEEN_REFRESHES = 5 * MINUTE

const now = () => Date.now()

export class RefreshScheduler {
  private timeoutId: number | null = null
  private tokenExpiry: number = 0
  private lastRefresh: number = 0

  constructor(public callback: () => void) {}

  scheduleRefresh(expiry: number) {
    this.clearRefresh()

    this.tokenExpiry = expiry
    this.lastRefresh = now()
    const scheduledDelay = Math.min(MAX_DELAY, (msUntilTokenExpires(expiry) - REFRESH_MARGIN))
    debug('Scheduling token refresh in %d ms', scheduledDelay)
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null
      this.callback()
    }, scheduledDelay)

    // Do a refresh when window becomes visible
    window.addEventListener('focus', () => this.runRefresh(), { once: true })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.runRefresh()
      }
    }, { once: true })
  }

  private runRefresh() {
    if (now() - this.lastRefresh < MINIMUM_TIME_BETWEEN_REFRESHES) {
      return
    }
    debug('Running token refresh manually')
    this.lastRefresh = now()
    this.clearRefresh()
    this.callback()
  }

  clearRefresh() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  hasExpired() {
    return msUntilTokenExpires(this.tokenExpiry) === 0
  }

  expire() {
    this.clearRefresh()
    this.tokenExpiry = 0
  }
}

export function msUntilTokenExpires(exp: number) {
  const nowMs = Date.now()
  const expMs = exp * 1000
  return Math.max(expMs - nowMs, 0)
}
