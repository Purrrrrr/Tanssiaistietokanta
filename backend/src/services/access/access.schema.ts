// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AccessService } from './access.class'
import { Id } from '../../utils/common-types'

const serviceNames = ['events', 'workshops', 'dances', 'users', 'files', 'volunteers', 'eventVolunteers', 'eventRoles', 'eventVolunteerAssignments'] as const
const serviceNameLiterals = serviceNames.map(name => Type.Literal(name))

export const serviceNameSchema = Type.Union(serviceNameLiterals, { $id: 'ServiceName' })

export type ServiceName = Static<typeof serviceNameSchema>
export const authTargetSchema = Type.Union([Type.Literal('everything'), Type.Literal('owner'), Type.Literal('entity')], { $id: 'AccessTarget' })
export type AuthTarget = Static<typeof authTargetSchema>

// Main data model schema
export const accessSchema = Type.Object(
  {
    service: serviceNameSchema,
    action: Type.String(),
    entityId: Type.Optional(Id()),
    owner: Type.Optional(Type.Ref(serviceNameSchema)),
    owningId: Type.Optional(Id()),
    target: authTargetSchema,
    // appliesTo: Type.Union([Type.Literal('everyone'), Type.Literal('user')]),
    allowed: Type.Union([Type.Literal('GRANT'), Type.Literal('DENY'), Type.Literal('UNKNOWN')], { $id: 'AccessAllowed' }),
  },
  { $id: 'Access', additionalProperties: false },
)
export type Access = Static<typeof accessSchema>
export const accessValidator = getValidator(accessSchema, dataValidator)
export const accessResolver = resolve<Access, HookContext<AccessService>>({})

export const accessExternalResolver = resolve<Access, HookContext<AccessService>>({})

// Schema for allowed query properties
export const accessQueryProperties = Type.Partial(Type.Intersect([
  Type.Pick(accessSchema, ['action', 'entityId', 'owningId']),
  Type.Object({
    service: Type.Optional(Type.Union(serviceNameLiterals)),
    owner: Type.Optional(Type.Union(serviceNameLiterals)),
  }),
]))
export const accessQuerySchema = Type.Intersect(
  [
    accessQueryProperties,
    // Add additional query properties here
    Type.Object({
      queries: Type.Optional(Type.Array(accessQueryProperties)),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type AccessQuery = Static<typeof accessQuerySchema>
export const accessQueryValidator = getValidator(accessQuerySchema, queryValidator)
export const accessQueryResolver = resolve<AccessQuery, HookContext<AccessService>>({})

export const graphQLSchema = {
  types: {
    Access: accessSchema,
  },
  inputs: {
    AccessQuery: accessQuerySchema,
  },
}
