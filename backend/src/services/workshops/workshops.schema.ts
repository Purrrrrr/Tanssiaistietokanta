// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { DateTime, Id, Name, Nullable } from '../../utils/common-types'

const WorkshopInstanceSchema = () =>Type.Object({
  _id: Id(),
  _versionId: Id(),
  _updatedAt: Type.String(),
  description: Type.String(),
  abbreviation: Type.String(),
  dateTime: DateTime(),
  durationInMinutes: Type.Integer(),
  danceIds: Nullable(Type.Array(Id())),
})

// Main data model schema
export const workshopsSchema = Type.Object(
  {
    _id: Id(),
    name: Name(),
    eventId: Id(),
    abbreviation: Type.String(),
    description: Type.String(),
    teachers: Type.String(),
    instances: Type.Array(WorkshopInstanceSchema()),
    instanceSpecificDances: Type.Boolean()
  },
  { $id: 'Workshops', additionalProperties: false }
)
export type Workshops = Static<typeof workshopsSchema>
export type WorkshopInstance = Workshops['instances'][number]
export const workshopsValidator = getValidator(workshopsSchema, dataValidator)
export const workshopsResolver = resolve<Workshops, HookContext>({})

export const workshopsExternalResolver = resolve<Workshops, HookContext>({})

// Schema for creating new entries
export const workshopsPartialDataSchema = Type.Intersect(
  [
    Type.Pick(workshopsSchema, ['name']),
    Type.Partial(
      Type.Omit(workshopsSchema, ['_id', 'name'])
    ),
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
export const workshopsQueryProperties = Type.Omit(workshopsSchema, ['instances'])
export const workshopsQuerySchema = Type.Intersect(
  [
    querySyntax(workshopsQueryProperties),
    // Add additional query properties here
    Type.Object({
      'instances.danceIds': Type.Optional(Id()),
      searchVersions: Type.Optional(Type.Boolean()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type WorkshopsQuery = Static<typeof workshopsQuerySchema>
export const workshopsQueryValidator = getValidator(workshopsQuerySchema, queryValidator)
export const workshopsQueryResolver = resolve<WorkshopsQuery, HookContext>({})
