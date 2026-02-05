// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { SessionsService } from './sessions.class'
import { Id } from '../../utils/common-types'
import ms from 'ms'

// Main data model schema
export const sessionSchema = Type.Object(
  {
    _id: Id(),
    userId: Id(),
    sessionId: Type.String(),
    token: Type.String(),
    _createdAt: Type.String(),
    _updatedAt: Type.String(),
    _expiresAt: Type.String(),
    // Data typically associated with a session: IP address, user agent, etc.
    IP: Type.String(),
    userAgent: Type.String(),
  },
  { $id: 'Sessions', additionalProperties: false },
)
export type Session = Static<typeof sessionSchema>
export const sessionValidator = getValidator(sessionSchema, dataValidator)
export const sessionResolver = resolve<Session, HookContext<SessionsService>>({})

export const sessionExternalResolver = resolve<Session, HookContext<SessionsService>>({})

// Schema for creating new entries
export const sessionDataSchema = Type.Object({}, {
  $id: 'SessionsData',
})
export type SessionData = Static<typeof sessionDataSchema>
export const sessionDataValidator = getValidator(sessionDataSchema, dataValidator)
export const newSessionDataResolver = resolve<Session, HookContext<SessionsService>>({
  _createdAt: () => new Date().toISOString(),
  userId: (_value, _session, context) => context.params?.user?._id,
  sessionId: (_, __, ctx) => ctx.params.sessionId,
  userAgent: (_value, session, context) => {
    return context.params.headers?.['user-agent'] ?? session.userAgent ?? ''
  },
})
export const sessionDataResolver = resolve<Session, HookContext<SessionsService>>({
  token: () => crypto.randomUUID().replaceAll('-', ''),
  _updatedAt: () => new Date().toISOString(),
  _expiresAt: (_value, _session, context) => {
    const { expiresIn } = context.app.get('authentication').refreshTokenOptions
    return new Date(Date.now() + ms(expiresIn as ms.StringValue)).toISOString()
  },
  IP: (_value, session, context) => context.params.IP ?? session.IP ?? '',
})

// Schema for updating existing entries
export const sessionPatchSchema = Type.Partial(sessionSchema, {
  $id: 'SessionsPatch',
})
export type SessionPatch = Static<typeof sessionPatchSchema>
export const sessionPatchValidator = getValidator(sessionPatchSchema, dataValidator)
export const sessionPatchResolver = resolve<Session, HookContext<SessionsService>>({})

// Schema for allowed query properties
export const sessionQueryProperties = sessionSchema // Type.Pick(sessionsSchema, ['id', 'text'])
export const sessionQuerySchema = Type.Intersect(
  [
    querySyntax(sessionQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type SessionQuery = Static<typeof sessionQuerySchema>
export const sessionQueryValidator = getValidator(sessionQuerySchema, queryValidator)
export const sessionQueryResolver = resolve<SessionQuery, HookContext<SessionsService>>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  userId: async (value, _session, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  },
})
