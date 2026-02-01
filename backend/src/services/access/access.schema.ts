// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AccessService } from './access.class'
import { Id } from '../../utils/common-types'

export const serviceNameSchema = Type.Union([
  Type.Literal('events'),
  Type.Literal('workshops'),
  Type.Literal('dances'),
  Type.Literal('users'),
], { $id: 'ServiceName' })

export type ServiceName = Static<typeof serviceNameSchema>

// Main data model schema
export const accessSchema = Type.Object(
  {
    service: serviceNameSchema,
    action: Type.String(),
    entityId: Type.Optional(Id()),
    target: Type.Union([Type.Literal('everything'), Type.Literal('entity')]),
    // appliesTo: Type.Union([Type.Literal('everyone'), Type.Literal('user')]),
    allowed: Type.Union([Type.Literal('GRANT'), Type.Literal('DENY'), Type.Literal('UNKNOWN')]),
  },
  { $id: 'Access', additionalProperties: false }
)
export type Access = Static<typeof accessSchema>
export const accessValidator = getValidator(accessSchema, dataValidator)
export const accessResolver = resolve<Access, HookContext<AccessService>>({})

export const accessExternalResolver = resolve<Access, HookContext<AccessService>>({})

// Schema for allowed query properties
export const accessQueryProperties = Type.Partial(Type.Pick(accessSchema, ['service', 'action', 'entityId']))
export const accessQuerySchema = Type.Intersect(
  [
    accessQueryProperties,
    // Add additional query properties here
    Type.Object({

    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AccessQuery = Static<typeof accessQuerySchema>
export const accessQueryValidator = getValidator(accessQuerySchema, queryValidator)
export const accessQueryResolver = resolve<AccessQuery, HookContext<AccessService>>({})
