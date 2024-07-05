import type { TSchema } from '@feathersjs/typebox'
import { Type } from '@feathersjs/typebox'

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
