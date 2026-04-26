// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { computedProperties, Id } from '../../utils/common-types'

// Main data model schema
export const eventVolunteerAssignmentsSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    eventId: Id(),
    workshopId: Type.Union([Id(), Type.Null()]),
    workshopInstanceIds: Type.Union([Type.Array(Id()), Type.Null()]),
    roleId: Id(),
    volunteerId: Id(),
  },
  { $id: 'EventVolunteerAssignments', additionalProperties: false },
)
export type EventVolunteerAssignments = Static<typeof eventVolunteerAssignmentsSchema>
export const eventVolunteerAssignmentsValidator = getValidator(eventVolunteerAssignmentsSchema, dataValidator)
export const eventVolunteerAssignmentsResolver = resolve<EventVolunteerAssignments, HookContext>({})

export const eventVolunteerAssignmentsExternalResolver = resolve<EventVolunteerAssignments, HookContext>({})

// Schema for creating new entries
export const eventVolunteerAssignmentsDataSchema = Type.Intersect(
  [
    Type.Pick(eventVolunteerAssignmentsSchema, ['eventId', 'roleId', 'volunteerId']),
    Type.Partial(Type.Omit(eventVolunteerAssignmentsSchema, [...computedProperties, 'eventId', 'roleId', 'volunteerId'])),
  ],
  { $id: 'EventVolunteerAssignmentsData' },
)
export type EventVolunteerAssignmentsData = Static<typeof eventVolunteerAssignmentsDataSchema>
export const eventVolunteerAssignmentsDataValidator = getValidator(eventVolunteerAssignmentsDataSchema, dataValidator)
export const eventVolunteerAssignmentsDataResolver = resolve<EventVolunteerAssignments, HookContext>({
  workshopId: value => value ?? null,
})

// Schema for updating existing entries
export const eventVolunteerAssignmentsPatchSchema = Type.Partial(eventVolunteerAssignmentsSchema, {
  $id: 'EventVolunteerAssignmentsPatch',
})
export type EventVolunteerAssignmentsPatch = Static<typeof eventVolunteerAssignmentsPatchSchema>
export const eventVolunteerAssignmentsPatchValidator = getValidator(eventVolunteerAssignmentsPatchSchema, dataValidator)
export const eventVolunteerAssignmentsPatchResolver = resolve<EventVolunteerAssignments, HookContext>({})

// Schema for allowed query properties
export const eventVolunteerAssignmentsQueryProperties = Type.Pick(eventVolunteerAssignmentsSchema, ['_id', 'eventId', 'workshopId', 'workshopInstanceIds', 'roleId', 'volunteerId'])
export const eventVolunteerAssignmentsQuerySchema = Type.Intersect(
  [
    querySyntax(eventVolunteerAssignmentsQueryProperties),
    Type.Object({
      workshopInstanceIds: Type.Optional(Id()),
      searchVersions: Type.Optional(Type.Boolean()),
      _versionId: Type.Optional(Id()),
      atDate: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type EventVolunteerAssignmentsQuery = Static<typeof eventVolunteerAssignmentsQuerySchema>
export const eventVolunteerAssignmentsQueryValidator = getValidator(eventVolunteerAssignmentsQuerySchema, queryValidator)
export const eventVolunteerAssignmentsQueryResolver = resolve<EventVolunteerAssignmentsQuery, HookContext>({})
