import { EventEmitter } from 'events'

export interface AuthResponse {
  accessToken: string
  authentication: {
    payload: {
      exp: number
    }
  }
  user: User
}
export interface User {
  _id: string
  email: string
}

export class AuthState extends EventEmitter<{ change: [AuthResponse | null] }> {
  private lastResponse: AuthResponse | null | undefined
  private initializationPromise = Promise.withResolvers()

  get initialized() {
    return this.lastResponse !== undefined
  }

  get currentUser() {
    return this.lastResponse?.user ?? null
  }

  get currentAccessToken() {
    return this.lastResponse?.accessToken ?? null
  }

  setState(response: AuthResponse | null) {
    this.lastResponse = response
    this.initializationPromise.resolve(true)
    this.emit('change', this.lastResponse)
  }

  waitForInitialization() {
    return this.initializationPromise.promise
  }
}
