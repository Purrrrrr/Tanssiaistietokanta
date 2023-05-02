// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const eventsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Events', additionalProperties: false }
)
export type Events = Static<typeof eventsSchema>
export const eventsValidator = getValidator(eventsSchema, dataValidator)
export const eventsResolver = resolve<Events, HookContext>({})

export const eventsExternalResolver = resolve<Events, HookContext>({})

// Schema for creating new entries
export const eventsDataSchema = Type.Pick(eventsSchema, ['text'], {
  $id: 'EventsData'
})
export type EventsData = Static<typeof eventsDataSchema>
export const eventsDataValidator = getValidator(eventsDataSchema, dataValidator)
export const eventsDataResolver = resolve<Events, HookContext>({})

// Schema for updating existing entries
export const eventsPatchSchema = Type.Partial(eventsSchema, {
  $id: 'EventsPatch'
})
export type EventsPatch = Static<typeof eventsPatchSchema>
export const eventsPatchValidator = getValidator(eventsPatchSchema, dataValidator)
export const eventsPatchResolver = resolve<Events, HookContext>({})

// Schema for allowed query properties
export const eventsQueryProperties = Type.Pick(eventsSchema, ['id', 'text'])
export const eventsQuerySchema = Type.Intersect(
  [
    querySyntax(eventsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type EventsQuery = Static<typeof eventsQuerySchema>
export const eventsQueryValidator = getValidator(eventsQuerySchema, queryValidator)
export const eventsQueryResolver = resolve<EventsQuery, HookContext>({})
