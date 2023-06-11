// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { Id, Name } from '../../utils/common-types'

// Main data model schema
export const workshopsSchema = Type.Object(
  {
    _id: Id(),
    name: Name(),
    eventId: Id(),
    abbreviation: Type.String(),
    description: Type.String(),
    teachers: Type.String(),
    danceIds: Type.Array(Id())
  },
  { $id: 'Workshops', additionalProperties: false }
)
export type Workshops = Static<typeof workshopsSchema>
export const workshopsValidator = getValidator(workshopsSchema, dataValidator)
export const workshopsResolver = resolve<Workshops, HookContext>({})

export const workshopsExternalResolver = resolve<Workshops, HookContext>({})

// Schema for creating new entries
export const workshopsPartialDataSchema = Type.Intersect(
  [
    Type.Pick(workshopsSchema, ['name']),
    Type.Partial(Type.Omit(workshopsSchema, ['_id', 'name'])),
  ], {
    $id: 'PartialWorkshopsData'
  },
)
export const workshopsDataSchema = Type.Omit(workshopsSchema, ['_id'], {
  $id: 'WorkshopsData'
})
export type WorkshopsData = Static<typeof workshopsDataSchema>
export const workshopsDataValidator = castAfterValidating(workshopsDataSchema, getValidator(workshopsPartialDataSchema, dataValidator))
export const workshopsDataResolver = resolve<Workshops, HookContext>({})

// Schema for updating existing entries
export const workshopsPatchSchema = Type.Partial(workshopsSchema, {
  $id: 'WorkshopsPatch'
})
export type WorkshopsPatch = Static<typeof workshopsPatchSchema>
export const workshopsPatchValidator = getValidator(workshopsPatchSchema, dataValidator)
export const workshopsPatchResolver = resolve<Workshops, HookContext>({})

// Schema for allowed query properties
export const workshopsQueryProperties = Type.Omit(workshopsSchema, ['danceIds'])
export const workshopsQuerySchema = Type.Intersect(
  [
    querySyntax(workshopsQueryProperties),
    // Add additional query properties here
    Type.Object({
      danceIds: Type.Optional(Id()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type WorkshopsQuery = Static<typeof workshopsQuerySchema>
export const workshopsQueryValidator = getValidator(workshopsQuerySchema, queryValidator)
export const workshopsQueryResolver = resolve<WorkshopsQuery, HookContext>({})
