// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { computedProperties, Id } from '../../utils/common-types'

// Main data model schema
export const eventVolunteersSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    eventId: Id(),
    volunteerId: Id(),
    interestedIn: Type.Array(Id()),
    wishes: Type.String(),
    notes: Type.String(),
  },
  { $id: 'EventVolunteers', additionalProperties: false },
)
export type EventVolunteers = Static<typeof eventVolunteersSchema>
export const eventVolunteersValidator = getValidator(eventVolunteersSchema, dataValidator)
export const eventVolunteersResolver = resolve<EventVolunteers, HookContext>({})

export const eventVolunteersExternalResolver = resolve<EventVolunteers, HookContext>({})

// Schema for creating new entries
export const eventVolunteersDataSchema = Type.Intersect(
  [
    Type.Pick(eventVolunteersSchema, ['eventId', 'volunteerId']),
    Type.Partial(Type.Omit(eventVolunteersSchema, [...computedProperties, 'eventId', 'volunteerId'])),
  ],
  { $id: 'EventVolunteersData' },
)
export type EventVolunteersData = Static<typeof eventVolunteersDataSchema>
export const eventVolunteersDataValidator = getValidator(eventVolunteersDataSchema, dataValidator)
export const eventVolunteersDataResolver = resolve<EventVolunteers, HookContext>({
  interestedIn: value => value ?? [],
  wishes: value => value ?? '',
  notes: value => value ?? '',
})

// Schema for updating existing entries
export const eventVolunteersPatchSchema = Type.Partial(eventVolunteersSchema, {
  $id: 'EventVolunteersPatch',
})
export type EventVolunteersPatch = Static<typeof eventVolunteersPatchSchema>
export const eventVolunteersPatchValidator = getValidator(eventVolunteersPatchSchema, dataValidator)
export const eventVolunteersPatchResolver = resolve<EventVolunteers, HookContext>({})

// Schema for allowed query properties
export const eventVolunteersQueryProperties = Type.Pick(eventVolunteersSchema, ['_id', 'eventId', 'volunteerId'])
export const eventVolunteersQuerySchema = Type.Intersect(
  [
    querySyntax(eventVolunteersQueryProperties),
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
      _versionId: Type.Optional(Id()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type EventVolunteersQuery = Static<typeof eventVolunteersQuerySchema>
export const eventVolunteersQueryValidator = getValidator(eventVolunteersQuerySchema, queryValidator)
export const eventVolunteersQueryResolver = resolve<EventVolunteersQuery, HookContext>({})
