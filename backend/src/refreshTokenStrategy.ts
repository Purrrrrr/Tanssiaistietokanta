import { AuthenticationParams, AuthenticationRequest, AuthenticationService, AuthenticationStrategy } from '@feathersjs/authentication'
import { parse, serialize } from 'cookie'

import type { Application, HookContext } from './declarations'
import { NotAuthenticated } from '@feathersjs/errors'
import ms from 'ms'
import { HookFunction } from '@feathersjs/feathers'

const defaultRefreshTokenOptions = {
  expiresIn: '30d',
}
type RefereshTokenOptions = typeof defaultRefreshTokenOptions

export class RefreshTokenStrategy implements AuthenticationStrategy {
  private config: RefereshTokenOptions = defaultRefreshTokenOptions
  private app: Application | null = null

  async setup(auth: AuthenticationService) {
    const config = {
      ...defaultRefreshTokenOptions,
      ...auth.configuration?.refreshToken as Partial<RefereshTokenOptions>
    }
    this.config = config
    this.app = auth.app as Application
  }

  async authenticate(_authentication: AuthenticationRequest, params: AuthenticationParams) {
    const cookies = parse(params.headers?.cookie || '')
    const { refreshToken } = cookies

    if (!refreshToken) {
      throw new NotAuthenticated('No refresh token cookie')
    }

    const user = await this.app?.service('users').get(refreshToken)
    if (!user) {
      throw new NotAuthenticated('Invalid refresh token')
    }

    console.log(refreshToken, user)

    return {
      authentication: { strategy: 'test', refreshToken, ...this.config },
      user
    }
  }
}

export const setRefreshTokenCookie: HookFunction<Application, AuthenticationService> = (context: HookContext) => {
  if (!context.http) return
  const { authentication } = context.result
  context.http.headers ??= {}
  context.http.headers['Set-Cookie'] = serialize(
    'refreshToken',
    authentication.refreshToken,
    {
      httpOnly: true,
      secure: true,
      maxAge: ms(authentication.expiresIn as ms.StringValue) / 1000,
    }
  )
}
