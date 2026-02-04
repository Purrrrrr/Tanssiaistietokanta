// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import * as L from 'partial.lenses'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static, TObject, TProperties } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { castAfterValidating } from '../../utils/cast-after-validating'
import { computedProperties, SlideStyleId, Id, Name, Date, NullableString, Nullable, DateTime } from '../../utils/common-types'

const DEFAULT_PAUSE_BETWEEN_DANCES = 3*60

// Main data model schema
export const eventsSchema = Type.Object(
  {
    _id: Id(),
    _versionId: Id(),
    _versionNumber: Type.Number(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    accessControl: EventAccessData(),
    name: Name(),
    beginDate: Date(),
    endDate: Date(),
    program: ClosedObject({
      dateTime: DateTime(),
      introductions: Introductions(),
      danceSets: Type.Array(DanceSet()),
      slideStyleId: SlideStyleId(),
      pauseBetweenDances: Type.Number({ default: DEFAULT_PAUSE_BETWEEN_DANCES }),
      defaultIntervalMusic: ClosedObject({
        name: NullableString(),
        description: NullableString(),
        showInLists: Type.Boolean(),
      })
    }),
    workshopVersions: Type.Record(Id(), Id())
  },
  { $id: 'Events', additionalProperties: false }
)

export const eventAccessDataSchema = EventAccessData()
export type EventAccessData = Static<typeof eventAccessDataSchema>

function EventAccessData() {
  return Type.Object({
    viewers: Type.Array(Type.String()),
  }, { additionalProperties: false })
}

function Introductions() {
  return ClosedObject({
    title: Type.String(),
    titleSlideStyleId: SlideStyleId(),
    program: Type.Array(ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Literal('EventProgram'),
      eventProgram: EventProgram(),
      danceId: Type.Optional(Type.Null()),
    }))
  })
}

function DanceSet() {
  return  ClosedObject({
    _id: Type.String(),
    title: Type.String(),
    titleSlideStyleId: SlideStyleId(),
    program: Type.Array(EventProgramRow()),
    intervalMusic: Nullable(ClosedObject({
      name: Nullable(Type.String()),
      description: Nullable(Type.String()),
      duration: Type.Number(),
      slideStyleId: SlideStyleId(),
      danceId: Nullable(Id()),
      showInLists: Type.Boolean(),
    }))
  })
}

function EventProgramRow() {
  return Type.Union([
    ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Literal('Dance'),
      danceId: Id(),
      eventProgram: Type.Optional(Type.Null()),
    }),
    ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Literal('RequestedDance'),
      danceId: Type.Optional(Type.Null()),
      eventProgram: Type.Optional(Type.Null()),
    }),
    ClosedObject({
      _id: Type.String(),
      slideStyleId: SlideStyleId(),
      type: Type.Literal('EventProgram'),
      danceId: Type.Optional(Type.Null()),
      eventProgram: Type.Optional(EventProgram()),
    }),
  ])
}

function EventProgram() {
  return ClosedObject({
    name: Type.String(),
    nameInLists: Nullable(Type.String()),
    description: Type.String(),
    duration: Type.Number(),
    showInLists: Type.Boolean(),
  })
}

function ClosedObject<P extends TProperties>(o: P): TObject<P> {
  return Type.Object(
    o, { additionalProperties: false }
  )
}

export type Events = Static<typeof eventsSchema>
export const eventsValidator = getValidator(eventsSchema, dataValidator)
export const eventsResolver = resolve<Events, HookContext>({

  program: async (program, _event, context) => {
    const danceService = context.app.service('dances')

    const fetchDance = async (item: { danceId: string }) => {
      if (!item) return item
      const dance = item.danceId
        ? await danceService.get(item.danceId).catch(() => null)
        : null
      return {
        ...item,
        dance
      }
    }

    return L.modifyAsync(
      ['danceSets', L.elems],
      async (danceSet: any) => {
        return {
          ...danceSet,
          intervalMusic: await fetchDance(danceSet.intervalMusic),
          program: await L.modifyAsync(L.elems, fetchDance, danceSet.program)
        }
      },
      program,
    )
  }
})

export const eventsExternalResolver = resolve<Events, HookContext>({})

// Schema for creating new entries
export const eventsPartialDataSchema = Type.Intersect(
  [
    Type.Pick(eventsSchema, ['name', 'beginDate', 'endDate']),
    Type.Partial(Type.Omit(eventsSchema, [...computedProperties, 'name', 'beginDate', 'endDate'])),
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
export const eventsPatchSchema = Type.Partial(
  Type.Omit(eventsSchema, ['_id']),
  {
    $id: 'EventsPatch'
  }
)
export type EventsPatch = Static<typeof eventsPatchSchema>
export const eventsPatchValidator = getValidator(eventsPatchSchema, dataValidator)
export const eventsPatchResolver = resolve<Events, HookContext>({})

// Schema for allowed query properties
export const eventsQueryProperties = eventsSchema
export const eventsQuerySchema = Type.Intersect(
  [
    querySyntax(eventsQueryProperties),
    // Add additional query properties here
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type EventsQuery = Static<typeof eventsQuerySchema>
export const eventsQueryValidator = getValidator(eventsQuerySchema, queryValidator)
export const eventsQueryResolver = resolve<EventsQuery, HookContext>({})
