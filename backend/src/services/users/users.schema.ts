// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { UserService } from './users.class'
import { Id } from '../../utils/common-types'

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: Id(),
    name: Type.String(),
    username: Type.String(),
    password: Type.Optional(Type.String()),
    sessionId: Type.Optional(Id()),
    email: Type.Optional(Type.String()),
    googleId: Type.Optional(Type.String()),
    githubId: Type.Optional(Type.String()),
    groups: Type.Array(Type.String()),
  },
  { $id: 'User', additionalProperties: false },
)
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext<UserService>>({
  sessionId: async (_: string | undefined, user: User, ctx) => {
    if (!ctx.params.user || ctx.params.user._id !== user._id) {
      return undefined
    }
    return ctx.params.sessionId
  },
})

export const userExternalResolver = resolve<User, HookContext<UserService>>({
  // The password should never be visible externally
  password: async () => undefined,
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(userSchema, ['username', 'password', 'name', 'email', 'googleId', 'githubId'], {
  $id: 'UserData',
})
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' }),
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch',
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext<UserService>>({
  password: passwordHash({ strategy: 'local' }),
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['_id', 'name', 'username', 'email', 'googleId', 'githubId', 'groups'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext<UserService>>({
  groups: async (value) => {
    // Prevent users without user role from logging in
    return value ?? 'user'
  },
})
