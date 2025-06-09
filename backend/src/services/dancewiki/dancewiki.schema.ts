// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { DancewikiService } from './dancewiki.class'
import { Nullable } from '../../utils/common-types'

// Main data model schema
export const dancewikiSchema = Type.Object(
  {
    _id: Type.String(),
    _fetchedAt: Nullable(Type.String()),
    status: Type.Union([
      Type.Literal('UNFETCHED'), // _fetchedAt == null && instructions == null
      Type.Literal('NOT_FOUND'), // _fetchedAt != null && instructions == null
      Type.Literal('FETCHED'),   // _fetchedAt != null && instructions != null

    ]),
    spamScore: Type.Number(),
    name: Type.String(),
    instructions: Nullable(Type.String()),
    formations: Type.Array(Type.String()),
    categories: Type.Array(Type.String()),
    sources: Type.Array(Type.String()),
    revision: Nullable(Type.Object({
      id: Type.Number(),
      parent: Type.Number(),
      timestamp: Type.String(),
      contents: Type.String(),
    })),
    metadataVersion: Nullable(Type.Number()),
  },
  { $id: 'Dancewiki', additionalProperties: false }
)
export type Dancewiki = Static<typeof dancewikiSchema>
export const dancewikiValidator = getValidator(dancewikiSchema, dataValidator)
export const dancewikiResolver = resolve<Dancewiki, HookContext<DancewikiService>>({})

export const dancewikiExternalResolver = resolve<Dancewiki, HookContext<DancewikiService>>({})

// Schema for creating new entries
export const dancewikiDataSchema = Type.Pick(dancewikiSchema, ['name'], {
  $id: 'DancewikiData'
})
export type DancewikiData = Static<typeof dancewikiDataSchema>
export const dancewikiDataValidator = getValidator(dancewikiDataSchema, dataValidator)
export const dancewikiDataResolver = resolve<Dancewiki, HookContext<DancewikiService>>({})

// Schema for allowed query properties
export const dancewikiQueryProperties = Type.Pick(dancewikiSchema, ['_id', '_fetchedAt', 'status', 'spamScore', 'name', 'instructions', 'formations', 'categories', 'sources', 'metadataVersion'])
export const dancewikiQuerySchema = Type.Intersect(
  [
    querySyntax(dancewikiQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type DancewikiQuery = Static<typeof dancewikiQuerySchema>
export const dancewikiQueryValidator = getValidator(dancewikiQuerySchema, queryValidator)
export const dancewikiQueryResolver = resolve<DancewikiQuery, HookContext<DancewikiService>>({})
