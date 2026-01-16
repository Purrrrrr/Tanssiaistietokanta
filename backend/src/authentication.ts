// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'

import type { Application } from './declarations'
import { clearRefreshTokenCookie, parseCookies, RefreshTokenStrategy, setRefreshTokenCookie } from './refreshTokenStrategy'
import { addLogData } from './requestLogger'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('refreshToken', new RefreshTokenStrategy())
  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
  app.service('authentication').hooks({
    before: {
      all: [parseCookies, (ctx) => {
        addLogData('refreshToken', ctx.params.cookies?.refreshToken ?? null)
        addLogData('authStrategy', ctx.params.authentication?.strategy ?? null)
        addLogData('username', ctx.data?.username)
        addLogData('password', ctx.data?.password ? '<hidden>' : undefined)
      }],
    },
    after: {
      create: [setRefreshTokenCookie(authentication)],
      remove: [clearRefreshTokenCookie()],
    },
  })
}
