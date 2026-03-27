// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { Id, Name } from '../../utils/common-types'

// Main data model schema
export const volunteersSchema = Type.Object(
  {
    _id: Id(),
    name: Name(),
    email: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    contact_details: Type.Array(Type.Any()),
  },
  { $id: 'Volunteers', additionalProperties: false },
)
export type Volunteers = Static<typeof volunteersSchema>
export const volunteersValidator = getValidator(volunteersSchema, dataValidator)
export const volunteersResolver = resolve<Volunteers, HookContext>({
  contact_details: value => value ?? [],
})

export const volunteersExternalResolver = resolve<Volunteers, HookContext>({})

// Schema for creating new entries
export const volunteersDataSchema = Type.Intersect(
  [
    Type.Pick(volunteersSchema, ['name']),
    Type.Partial(Type.Omit(volunteersSchema, ['_id', 'name'])),
  ],
  { $id: 'VolunteersData' },
)
export type VolunteersData = Static<typeof volunteersDataSchema>
export const volunteersDataValidator = getValidator(volunteersDataSchema, dataValidator)
export const volunteersDataResolver = resolve<Volunteers, HookContext>({})

// Schema for updating existing entries
export const volunteersPatchSchema = Type.Partial(volunteersSchema, {
  $id: 'VolunteersPatch',
})
export type VolunteersPatch = Static<typeof volunteersPatchSchema>
export const volunteersPatchValidator = getValidator(volunteersPatchSchema, dataValidator)
export const volunteersPatchResolver = resolve<Volunteers, HookContext>({})

// Schema for allowed query properties
export const volunteersQueryProperties = Type.Pick(volunteersSchema, ['_id', 'name', 'email', 'phone'])
export const volunteersQuerySchema = Type.Intersect(
  [
    querySyntax(volunteersQueryProperties),
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type VolunteersQuery = Static<typeof volunteersQuerySchema>
export const volunteersQueryValidator = getValidator(volunteersQuerySchema, queryValidator)
export const volunteersQueryResolver = resolve<VolunteersQuery, HookContext>({})
