import { GetUserQuery } from 'types/gql/graphql'

export interface AuthResponse {
  accessToken: string
  authentication: {
    payload: {
      exp: number
    }
  }
  user: User
}

export type User = GetUserQuery['user']
