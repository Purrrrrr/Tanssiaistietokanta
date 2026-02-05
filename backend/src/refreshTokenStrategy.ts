import { AuthenticationParams, AuthenticationRequest, AuthenticationService, AuthenticationStrategy } from '@feathersjs/authentication'
import { parse, serialize } from 'cookie'
import { IncomingMessage, ServerResponse } from 'http'

import type { Application, HookContext } from './declarations'
import { NotAuthenticated } from '@feathersjs/errors'
import ms from 'ms'
import { HookFunction } from '@feathersjs/feathers'
import { SessionsService } from './services/sessions/sessions.class'
import { UserService } from './services/users/users.class'

const defaultRefreshTokenOptions = {
  expiresIn: '30d',
}
type RefereshTokenOptions = typeof defaultRefreshTokenOptions

export class RefreshTokenStrategy implements AuthenticationStrategy {
  private app: Application | null = null
  private sessionService: SessionsService | null = null
  private userService: UserService | null = null

  async setup(auth: AuthenticationService) {
    this.app = auth.app as Application
    this.sessionService = this.app.service('sessions')
    this.userService = this.app.service('users')
  }

  async parse(req: IncomingMessage, _res: ServerResponse): Promise<AuthenticationRequest | null> {
    if (req.headers.authorization) {
      // Prefer other strategies if Authorization header is present
      return null
    }
    const cookies = parse(req.headers.cookie ?? '')
    if (cookies.refreshToken) {
      return { strategy: 'refreshToken', refreshToken: cookies.refreshToken }
    }
    return null
  }

  async authenticate(authentication: AuthenticationRequest, params: AuthenticationParams) {
    const refreshToken = authentication.refreshToken ?? params.cookies?.refreshToken ?? null

    if (!refreshToken) {
      throw new NotAuthenticated('No refresh token cookie')
    }
    if (!this.sessionService || !this.userService) {
      throw new NotAuthenticated('Authentication strategy not initialized')
    }

    const [session] = await this.sessionService.find({ query: { token: refreshToken } })
    if (!session) {
      throw new NotAuthenticated('Invalid refresh token')
    }
    const user = await this.userService.get(session.userId)
    if (!user) {
      throw new NotAuthenticated('User not found')
    }

    return {
      authentication: { strategy: 'refreshToken' },
      user,
    }
  }
}

export const setRefreshTokenCookie = (auth: AuthenticationService): HookFunction<Application, AuthenticationService> => {
  const config = {
    ...defaultRefreshTokenOptions,
    ...auth.configuration?.refreshToken as Partial<RefereshTokenOptions>,
  }
  const maxAge = ms(config.expiresIn as ms.StringValue) / 1000

  return async (context: HookContext) => {
    if (!context.http) return
    const sessionService = context.app.service('sessions')
    const existingToken = context.params.cookies?.refreshToken as string | undefined
    const [existingSession] = existingToken
      ? await sessionService.find({ query: {
        token: existingToken,
      } })
      : [null]

    let newToken: string
    if (existingSession) {
      const updateResult = await sessionService.patch(existingSession._id, {}, {
        ...context.params,
        provider: null,
      })
      newToken = Array.isArray(updateResult) ? updateResult[0].token : updateResult.token
    } else {
      const user = context.result.user
      const createResult = await sessionService.create({}, { ...context.params, provider: null, user })
      newToken = createResult.token
    }

    setTokenCookie(context.http, newToken, maxAge)
  }
}

export const clearRefreshTokenCookie = (): HookFunction<Application, AuthenticationService> => {
  return async (context: HookContext) => {
    if (!context.http) return
    const sessionService = context.app.service('sessions')
    const existingToken = context.params.cookies?.refreshToken as string | undefined
    if (!existingToken) {
      return
    }
    const [existingSession] = await sessionService.find({ query: {
      token: existingToken,
    } })

    if (existingSession) {
      await sessionService.remove(existingSession._id, context.params)
    }

    setTokenCookie(context.http, 'nil', 0)
  }
}

const cookiesSecure = process.env.CORS_ALLOW_LOCALHOST !== 'true'
const cookieOpts = {
  httpOnly: true,
  secure: cookiesSecure,
}

function setTokenCookie(
  http: Exclude<HookContext['http'], undefined>,
  value: string,
  maxAge?: number,
) {
  http.headers ??= {}
  http.headers['Set-Cookie'] = serialize(
    'refreshToken',
    value,
    { ...cookieOpts, maxAge },
  )
}
