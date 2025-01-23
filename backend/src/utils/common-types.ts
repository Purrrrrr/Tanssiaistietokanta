import type { ObjectPropertyKeys, TObject, TOmit, TSchema } from '@feathersjs/typebox'
import { Kind, Type } from '@feathersjs/typebox'

export function Name() {
  return Type.String({
    minLength: 1,
  })
}
export function Id() {
  return Type.String({
    minLength: 1,
  })
}
export function SlideStyleId() {
  return Type.Union([Type.Null(), Type.String()])
}
export function Nullable<T extends TSchema>(t: T) {
  return Type.Union([Type.Null(), t])
}
export function NullableString() {
  return Type.Union([Type.Null(), Type.String()])
}

export function Date() {
  return Type.String({
    format: 'date',
    default: '2000-01-01',
  })
}

export function DateTime() {
  return Type.String({
    format: 'iso-date-time',
    default: '2000-01-01T00:00:00',
  })
}

export const computedProperties = ['_id', '_versionId', '_versionNumber', '_updatedAt', '_createdAt'] as const
type ComputedProperties = (typeof computedProperties)[number][]

export function omitComputedProperties<T extends TSchema>(schema: T) {
  return isObjectSchema(schema)
    ? omitComputedPropertiesFromObject(schema)
    : schema
}

export function omitComputedPropertiesFromObject<T extends TObject>(schema: T): TOmit<T, ComputedProperties & ObjectPropertyKeys<T>[]> {
  return Type.Omit(schema, computedProperties as unknown as ObjectPropertyKeys<T>[]) as TOmit<T, ObjectPropertyKeys<T>[] & ComputedProperties>
}

function isObjectSchema(schema: TSchema): schema is TObject {
  return schema[Kind] === 'Object'
}
