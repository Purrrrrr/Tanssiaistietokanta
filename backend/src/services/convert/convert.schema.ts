// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const convertSchema = Type.String(
  { $id: 'Convert', additionalProperties: false }
)
export type Convert = Static<typeof convertSchema>

// Schema for creating new entries
export const convertDataSchema = Type.Object({
  input: Type.String(),
  inputFormat: Type.String(),
  outputFormat: Type.String(),
}, {
  $id: 'ConvertData'
})
export type ConvertData = Static<typeof convertDataSchema>
export const convertDataValidator = getValidator(convertDataSchema, dataValidator)

// Schema for allowed query properties
export const convertQuerySchema = convertDataSchema
export type ConvertQuery = Static<typeof convertQuerySchema>
export const convertQueryValidator = getValidator(convertQuerySchema, queryValidator)
export const convertQueryResolver = resolve<ConvertQuery, HookContext>({})
