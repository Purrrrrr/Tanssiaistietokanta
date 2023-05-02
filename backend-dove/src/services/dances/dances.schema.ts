// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static, TSchema } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()])

// Main data model schema
export const dancesSchema = Type.Object(
  {
    _id: Type.String(),
    name: Type.String(),
    description: Nullable(Type.String()),
    duration: Nullable(Type.Number()),
    prelude: Nullable(Type.String()),
    formation: Nullable(Type.String()),
    category: Nullable(Type.String()),
    instructions: Nullable(Type.String()),
    remarks: Nullable(Type.String()),
    slideStyleId: Nullable(Type.String()),
  },
  { $id: 'Dances', additionalProperties: false }
)
export type Dances = Static<typeof dancesSchema>
export const dancesValidator = getValidator(dancesSchema, dataValidator)
export const dancesResolver = resolve<Dances, HookContext>({})

export const dancesExternalResolver = resolve<Dances, HookContext>({})

// Schema for creating new entries
export const dancesDataSchema = Type.Omit(dancesSchema, ['_id'], {
  $id: 'DancesData'
})
export type DancesData = Static<typeof dancesDataSchema>
export const dancesDataValidator = getValidator(dancesDataSchema, dataValidator)
export const dancesDataResolver = resolve<Dances, HookContext>({})

// Schema for updating existing entries
export const dancesPatchSchema = Type.Partial(dancesSchema, {
  $id: 'DancesPatch'
})
export type DancesPatch = Static<typeof dancesPatchSchema>
export const dancesPatchValidator = getValidator(dancesPatchSchema, dataValidator)
export const dancesPatchResolver = resolve<Dances, HookContext>({})

// Schema for allowed query properties
export const dancesQueryProperties = dancesSchema
export const dancesQuerySchema = Type.Intersect(
  [
    querySyntax(dancesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type DancesQuery = Static<typeof dancesQuerySchema>
export const dancesQueryValidator = getValidator(dancesQuerySchema, queryValidator)
export const dancesQueryResolver = resolve<DancesQuery, HookContext>({})
