// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { computedProperties, DateTime, DocumentContent, Id, Name, Nullable } from '../../utils/common-types'

const WorkshopInstanceSchema = () => Type.Object({
  _id: Id(),
  abbreviation: Type.String(),
  dateTime: DateTime(),
  durationInMinutes: Type.Integer(),
  danceIds: Nullable(Type.Array(Id())),
})

// Main data model schema
export const workshopsSchema = Type.Object(
  {
    _id: Id(),
    _versionId: Id(),
    _versionNumber: Type.Number(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    name: Name(),
    eventId: Id(),
    abbreviation: Type.String(),
    description: DocumentContent(),
    instances: Type.Array(WorkshopInstanceSchema()),
    instanceSpecificDances: Type.Boolean(),
    _childEventVolunteerAssignmentsUpdatedAt: Type.Optional(Type.String()),
  },
  { $id: 'Workshops', additionalProperties: false },
)
export type Workshops = Static<typeof workshopsSchema>
export type WorkshopInstance = Workshops['instances'][number]
// This is only for graphql resolver types
export type WorkshopInstanceType = Workshops['instances'][number]
export const workshopsValidator = getValidator(workshopsSchema, dataValidator)
export const workshopsResolver = resolve<Workshops, HookContext>({})

export const workshopsExternalResolver = resolve<Workshops, HookContext>({})

// Schema for creating new entries
export const workshopsDataSchema = Type.Intersect(
  [
    Type.Pick(workshopsSchema, ['name']),
    Type.Partial(
      Type.Omit(workshopsSchema, [...computedProperties, 'name', 'instances', '_childEventVolunteerAssignmentsUpdatedAt']),
    ),
    Type.Object({
      instances: Type.Optional(Type.Array(
        Type.Partial(WorkshopInstanceSchema()),
      )),
    }),
  ], {
    $id: 'PartialWorkshopsData',
  },
)
export const workshopsFullDataSchema = Type.Omit(workshopsSchema, ['_id', ...computedProperties], {
  $id: 'WorkshopsData',
})
export type WorkshopsData = Static<typeof workshopsDataSchema>
export const workshopsDataValidator = castAfterValidating(workshopsFullDataSchema, getValidator(workshopsDataSchema, dataValidator))
export const workshopsDataResolver = resolve<Workshops, HookContext>({})

// Schema for updating existing entries
export const workshopsPatchSchema = Type.Partial(workshopsSchema, {
  $id: 'WorkshopsPatch',
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
      teacherIds: Type.Optional(Id()),
      'instances.danceIds': Type.Optional(Id()),
      searchVersions: Type.Optional(Type.Boolean()),
      atDate: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type WorkshopsQuery = Static<typeof workshopsQuerySchema>
export const workshopsQueryValidator = getValidator(workshopsQuerySchema, queryValidator)
export const workshopsQueryResolver = resolve<WorkshopsQuery, HookContext>({})
