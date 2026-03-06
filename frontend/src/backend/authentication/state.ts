import { EventEmitter } from 'events'

import { AuthResponse } from './types'

interface AuthStateEvents {
  change: [AuthResponse | null]
}

export class AuthState extends EventEmitter<AuthStateEvents> {
  private lastResponse: AuthResponse | null | undefined

  get currentUser() {
    return this.lastResponse?.user ?? null
  }

  get currentAccessToken() {
    return this.lastResponse?.accessToken ?? null
  }

  get authExpiresAt() {
    return this.lastResponse?.authentication.payload.exp ?? null
  }

  setState(response: AuthResponse | null) {
    this.lastResponse = response
    this.emit('change', this.lastResponse)
  }
}
