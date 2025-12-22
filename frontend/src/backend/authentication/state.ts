import { EventEmitter } from 'events'

import { AuthResponse } from './types'

interface AuthStateEvents {
  change: [AuthResponse | null]
  initialize: []
}

export class AuthState extends EventEmitter<AuthStateEvents> {
  private lastResponse: AuthResponse | null | undefined
  private initializationPromise = Promise.withResolvers()

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
    this.initializationPromise.resolve(true)
    this.emit('change', this.lastResponse)
  }

  initialize() {
    if (this.lastResponse === undefined) {
      this.lastResponse = null
      this.emit('initialize')
    }
    return this.initializationPromise.promise
  }
}
