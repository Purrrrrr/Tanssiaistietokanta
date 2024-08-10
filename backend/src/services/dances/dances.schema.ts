// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static, TSchema } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { SlideStyleId, Id, Name } from '../../utils/common-types'

// Main data model schema
export const dancesSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    name: Name(),
    description: Type.String(),
    duration: Type.Number(),
    prelude: Type.String(),
    formation: Type.String(),
    source: Type.String(),
    category: Type.String(),
    instructions: Type.String(),
    remarks: Type.String(),
    slideStyleId: SlideStyleId(),
  },
  { $id: 'Dances', additionalProperties: false }
)
export type Dances = Static<typeof dancesSchema>
export const dancesValidator = getValidator(dancesSchema, dataValidator)
export const dancesResolver = resolve<Dances, HookContext>({
  description: value => value ?? '',
  prelude: value => value ?? '',
  formation: value => value ?? '',
  source: value => value ?? '',
  category: value => value ?? '',
  instructions: value => value ?? '',
  remarks: value => value ?? '',
})

export const dancesExternalResolver = resolve<Dances, HookContext>({})

// Schema for creating new entries
export const dancesPartialDataSchema = Type.Intersect(
  [
    Type.Pick(dancesSchema, ['name']),
    Type.Partial(Type.Omit(dancesSchema, ['_id', 'name'])),
  ], {
    $id: 'DancesData'
  },
)
export const dancesDataSchema = Type.Omit(dancesSchema, ['_id'])
export type DancesData = Static<typeof dancesDataSchema>
export const dancesDataValidator = castAfterValidating(dancesDataSchema, getValidator(dancesPartialDataSchema, dataValidator))
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
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type DancesQuery = Static<typeof dancesQuerySchema>
export const dancesQueryValidator = getValidator(dancesQuerySchema, queryValidator)
export const dancesQueryResolver = resolve<DancesQuery, HookContext>({})
