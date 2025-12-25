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
  name: string
  username: string
  email?: string
}
