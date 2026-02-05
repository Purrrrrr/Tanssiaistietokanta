import type { Static, TSchema } from '@feathersjs/typebox'
import type { Validator } from '@feathersjs/schema'
import { Value } from '@sinclair/typebox/value'
import { omitComputedProperties } from './common-types'

export function castAfterValidating<S extends TSchema, T>(schema: S, validator: Validator<T>): Validator<T, Static<S>> {
  return async (v: T) => Value.Cast(omitComputedProperties(schema), await validator(v))
}
