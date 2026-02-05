import { Application, HookContext } from '../declarations'
import { parse, serialize } from 'cookie'
import { Middleware } from 'koa'
import createId from '../utils/random-id'

declare module '@feathersjs/feathers' {
  interface Params {
    cookies?: Record<string, string | undefined>
    instanceId?: string
    sessionId?: string
    IP?: string
  }
}

const SESSION_COOKIE_NAME = 'danceOrganizerSessionID'
const LOGGED_IN_COOKIE_NAME = 'danceOrganizerLoggedIn'
const YES = 'yes'
const NO = 'no'
const YEAR = 60 * 60 * 24 * 365

type Headers = Record<string, string | undefined>

export function socketIOSessionCookieMiddleware(headers: any, request: { headers: Headers }) {
  const cookies = parse(request.headers.cookie ?? '')
  let sessionId = cookies[SESSION_COOKIE_NAME]
  if (!sessionId) {
    sessionId = createId()
    headers['Set-Cookie'] = getNewSessionCookies(sessionId)
    request.headers.cookie = [
      request.headers.cookie,
      serialize(SESSION_COOKIE_NAME, sessionId),
    ].filter(Boolean).join('; ')
  }
}

export const restSessionCookieMiddleware: Middleware = async (ctx, next) => {
  const { request, res } = ctx
  const cookie = request.headers.cookie ?? ''
  const cookies = parse(cookie)
  let sessionId = cookies[SESSION_COOKIE_NAME]
  if (!sessionId) {
    sessionId = createId()
    res.setHeader('Set-Cookie', getNewSessionCookies(sessionId))
  }

  // Set stuff to feathers context params
  const params = ctx.feathers ??= {}
  params.IP = request.ip
  params.cookies = cookies
  params.sessionId = sessionId
  await next()
}

export default function setupSessions(app: Application) {
  const instanceId = createId()
  app.set('instanceId', instanceId)
  app.on('login', (_authResult, _params, ctx: HookContext) => {
    setCookies(ctx, makeCookie(LOGGED_IN_COOKIE_NAME, YES, false))
  })
  app.on('logout', (_authResult, _params, ctx: HookContext) => {
    setCookies(ctx, [
      makeCookie(LOGGED_IN_COOKIE_NAME, NO, false),
      makeCookie(SESSION_COOKIE_NAME, ''),
    ])
  })
  app.on('connection', (connection) => {
    const cookies = parse(connection.headers?.cookie ?? '')
    connection.id = createId()
    connection.sessionId = cookies[SESSION_COOKIE_NAME] ?? ''
  })
}

function getNewSessionCookies(sessionId: string) {
  return [
    makeCookie(SESSION_COOKIE_NAME, sessionId),
    makeCookie(LOGGED_IN_COOKIE_NAME, NO, false),
  ]
}

function setCookies(ctx: HookContext, cookies: string | string[]) {
  if (!ctx.http) return
  ctx.http.headers ??= {}
  const { headers, headers: { ['Set-Cookie']: setCookie } } = ctx.http

  if (setCookie) {
    const cookieList = Array.isArray(cookies) ? cookies : [cookies]
    const existingCookies = Array.isArray(setCookie) ? setCookie : [setCookie]
    headers['Set-Cookie'] = [...existingCookies, ...cookieList]
    return
  } else {
    headers['Set-Cookie'] = cookies
  }
}

function makeCookie(name: string, value: string, httpOnly = true) {
  return serialize(
    name,
    value, {
      path: '/',
      secure: process.env.CORS_ALLOW_LOCALHOST !== 'true',
      httpOnly,
      maxAge: YEAR,
    },
  )
}
