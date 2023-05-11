// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static, TProperties } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { SlideStyleId, Id, Name, NullableString, Nullable } from '../../utils/common-types'

const DEFAULT_PAUSE_BETWEEN_DANCES = 3*60

// Main data model schema
export const eventsSchema = Type.Object(
  {
    _id: Id(),
    name: Name(),
    program: ClosedObject({
      introductions: Introductions(),
      danceSets: Type.Array(DanceSet()),
      slideStyleId: SlideStyleId(),
      pauseBetweenDances: Type.Number({ default: DEFAULT_PAUSE_BETWEEN_DANCES }),
      defaultIntervalMusic: ClosedObject({
        name: NullableString(),
        description: NullableString(),
      })
    }),
  },
  { $id: 'Events', additionalProperties: false }
)

function Introductions() {
  return ClosedObject({
    title: Type.String(),
    titleSlideStyleId: SlideStyleId(),
    program: Type.Array(ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Literal('EventProgram'),
      eventProgram: EventProgram(),
    }))
  })
}
function DanceSet() {
  return  ClosedObject({
    _id: Type.String(),
    title: Type.String(),
    titleSlideStyleId: SlideStyleId(),
    program: Type.Array(ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Union([
        Type.Literal('Dance'),
        Type.Literal('RequestedDance'),
        Type.Literal('EventProgram'),
      ]),
      dance: Type.Optional(Type.String()),
      eventProgram: Type.Optional(EventProgram()),
    })),
    intervalMusic: Nullable(ClosedObject({
      name: Type.String(),
      description: Type.String(),
      duration: Type.Number(),
      slideStyleId: SlideStyleId(),
    }))
  })
}
function EventProgram() {
  return ClosedObject({
    name: Type.String(),
    description: Type.String(),
    duration: Type.Number(),
    showInLists: Type.Boolean(),
  })
}
function ClosedObject(o: TProperties) {
  return Type.Object(
    o, { additionalProperties: false }
  )
}

export type Events = Static<typeof eventsSchema>
export const eventsValidator = getValidator(eventsSchema, dataValidator)
export const eventsResolver = resolve<Events, HookContext>({})

export const eventsExternalResolver = resolve<Events, HookContext>({})

// Schema for creating new entries
export const eventsPartialDataSchema = Type.Intersect(
  [
    Type.Pick(eventsSchema, ['name']),
    Type.Partial(Type.Omit(eventsSchema, ['_id', 'name'])),
  ], {
    $id: 'PartialEventsData'
  })
export const eventsDataSchema = Type.Omit(eventsSchema, ['_id'], {
  $id: 'EventsData'
})
export type EventsData = Static<typeof eventsDataSchema>
export const eventsDataValidator = castAfterValidating(eventsDataSchema, getValidator(eventsPartialDataSchema, dataValidator))
export const eventsDataResolver = resolve<Events, HookContext>({})

// Schema for updating existing entries
export const eventsPatchSchema = Type.Partial(eventsSchema, {
  $id: 'EventsPatch'
})
export type EventsPatch = Static<typeof eventsPatchSchema>
export const eventsPatchValidator = getValidator(eventsPatchSchema, dataValidator)
export const eventsPatchResolver = resolve<Events, HookContext>({})

// Schema for allowed query properties
export const eventsQueryProperties = eventsSchema
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
