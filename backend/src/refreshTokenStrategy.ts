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
  private app: Application | null = null

  async setup(auth: AuthenticationService) {
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
      authentication: { strategy: 'refreshToken' },
      user
    }
  }
}

const cookiesSecure = process.env.CORS_ALLOW_LOCALHOST !== 'true'
const cookieOpts = {
  httpOnly: true,
  secure: cookiesSecure,
}

export const setRefreshTokenCookie = (auth: AuthenticationService): HookFunction<Application, AuthenticationService> => {
  const config = {
    ...defaultRefreshTokenOptions,
    ...auth.configuration?.refreshToken as Partial<RefereshTokenOptions>
  }
  const maxAge = ms(config.expiresIn as ms.StringValue) / 1000

  return (context: HookContext) => {
    setCookie(context, context.result.user._id, maxAge)
    console.log(context.result)
  }
}

export const clearRefreshTokenCookie = (): HookFunction<Application, AuthenticationService> => {
  return (context: HookContext) => {
    setCookie(context, 'nil', 0)
  }
}

function setCookie(context: HookContext, value: string, maxAge?: number) {
  if (!context.http) return

  context.http.headers ??= {}
  context.http.headers['Set-Cookie'] = serialize(
    'refreshToken',
    value,
    { ...cookieOpts, maxAge, },
  )
}
