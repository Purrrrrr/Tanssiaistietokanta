import type { ObjectPropertyKeys, TNull, TObject, TOmit, TPartial, TProperties, TSchema, TUnion } from '@feathersjs/typebox'
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
export function DocumentContent() {
  // TODO: define more explicitly
  return Type.Any()
}

export function Nullable<T extends TSchema>(t: T) {
  return Type.Union([Type.Null(), t])
}
export function NullableString() {
  return Type.Union([Type.Null(), Type.String()])
}

export function NullablePartial<T extends TProperties>(schema: TObject<T>): TPartial<TObject<{
  [K in keyof T]: TUnion<[T[K], TNull]>
}>> {
  const nullableProps: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(schema.properties)) {
    nullableProps[key] = Type.Union([value as any, Type.Null()])
  }

  return Type.Partial({
    ...schema,
    properties: nullableProps,
  } as any)
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

export function removeNulls<T extends object>(obj: T): ExcludeNulls<T> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as ExcludeNulls<T>
}

type ExcludeNulls<T extends object> = {
  [K in keyof T]: Exclude<T[K], null>
}
