// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { computedProperties, Id, Name } from '../../utils/common-types'

// Main data model schema
export const eventRolesSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    name: Name(),
    description: Type.String(),
    appliesToWorkshops: Type.Boolean(),
    order: Type.Number(),
  },
  { $id: 'EventRoles', additionalProperties: false },
)
export type EventRoles = Static<typeof eventRolesSchema>
export const eventRolesValidator = getValidator(eventRolesSchema, dataValidator)
export const eventRolesResolver = resolve<EventRoles, HookContext>({
  description: value => value ?? '',
  appliesToWorkshops: value => value ?? false,
  order: value => value ?? 0,
})

export const eventRolesExternalResolver = resolve<EventRoles, HookContext>({})

// Schema for creating new entries
export const eventRolesDataSchema = Type.Intersect(
  [
    Type.Pick(eventRolesSchema, ['name']),
    Type.Partial(Type.Omit(eventRolesSchema, [...computedProperties, 'name'])),
  ],
  { $id: 'EventRolesData' },
)
export type EventRolesData = Static<typeof eventRolesDataSchema>
export const eventRolesDataValidator = getValidator(eventRolesDataSchema, dataValidator)
export const eventRolesDataResolver = resolve<EventRoles, HookContext>({})

// Schema for updating existing entries
export const eventRolesPatchSchema = Type.Partial(eventRolesSchema, {
  $id: 'EventRolesPatch',
})
export type EventRolesPatch = Static<typeof eventRolesPatchSchema>
export const eventRolesPatchValidator = getValidator(eventRolesPatchSchema, dataValidator)
export const eventRolesPatchResolver = resolve<EventRoles, HookContext>({})

// Schema for allowed query properties
export const eventRolesQueryProperties = Type.Pick(eventRolesSchema, ['_id', 'name', 'appliesToWorkshops', 'order'])
export const eventRolesQuerySchema = Type.Intersect(
  [
    querySyntax(eventRolesQueryProperties),
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
      _versionId: Type.Optional(Id()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type EventRolesQuery = Static<typeof eventRolesQuerySchema>
export const eventRolesQueryValidator = getValidator(eventRolesQuerySchema, queryValidator)
export const eventRolesQueryResolver = resolve<EventRolesQuery, HookContext>({})
