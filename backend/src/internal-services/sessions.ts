import { Application, HookContext } from "../declarations";
import { parse, serialize } from 'cookie'
import { chunk } from "es-toolkit";

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
  const cookies = parse(request.headers.cookie || '')
  let sessionId = cookies[SESSION_COOKIE_NAME]
  if (!sessionId) {
    sessionId = createId()
    headers['Set-Cookie'] = getNewSessionCookies(sessionId)
    request.headers.cookie = [
      request.headers.cookie,
      serialize(SESSION_COOKIE_NAME, sessionId)
    ].filter(Boolean).join('; ')
  }
}

export default function setupSessions(app: Application) {
  const instanceId = createId()
  app.set('instanceId', instanceId)

  app.use(async (ctx, next) => {
    const { request, res } = ctx
    const cookie = request.headers.cookie || ''
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
  })
  app.on('login', (_authResult, _params, ctx: HookContext) => {
    if (!ctx.http) return
    ctx.http.headers ??= {}
    ctx.http.headers['Set-Cookie'] = makeCookie(LOGGED_IN_COOKIE_NAME, YES, YEAR)
  })
  app.on('logout', (_authResult, _params, ctx: HookContext) => {
    if (!ctx.http) return
    ctx.http.headers ??= {}
    ctx.http.headers['Set-Cookie'] = [
      makeCookie(LOGGED_IN_COOKIE_NAME, NO, YEAR),
      makeCookie(SESSION_COOKIE_NAME, '', YEAR)
    ]
  })
  app.on('connection', (connection) => {
    const cookies = parse(connection.headers?.cookie || '')
    connection.id = createId()
    connection.sessionId
    connection.sessionId = cookies[SESSION_COOKIE_NAME] || ''
  })
}

function getNewSessionCookies(sessionId: string) {
  return [
    makeCookie(SESSION_COOKIE_NAME, sessionId, YEAR),
    makeCookie(LOGGED_IN_COOKIE_NAME, NO, YEAR),
  ]
}

const cookiesSecure = process.env.CORS_ALLOW_LOCALHOST !== 'true'
const cookieOpts = {
  path: '/',
  httpOnly: true,
  secure: cookiesSecure,
}

function makeCookie(name: string, value: string, maxAge?: number) {
  return serialize(
    name,
    value,
    { ...cookieOpts, maxAge, },
  )
}

function createId(): string {
  const uuid = crypto.randomUUID()
    .replaceAll('-', '')
    .slice(0, 10)
  // Add dashes between every 2 characters for readability
  return uuid.match(/.{1,2}/g)!.join('-').toUpperCase()
}
