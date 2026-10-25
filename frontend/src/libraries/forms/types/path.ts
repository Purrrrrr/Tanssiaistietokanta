import type { TypedPath } from '@/libraries/common/paths'

export type { ValueAtPath as PropertyAtPath } from '@/libraries/common/accessor'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyList = any[]
export type StringPath<Target, Depth extends number = 8> = TypedPath<unknown, never, Target, Depth>
export type StringPathToList<Target, Depth extends number = 8> = TypedPath<unknown[] | null | undefined, never, Target, Depth>
/* eslint-enable @typescript-eslint/no-explicit-any */
export type TypedStringPath<Type, Target, Depth extends number = 8> = TypedPath<Type | null | undefined, Type, Target, Depth>

const numberRegex = /^(:?[1-9][0-9]*)|0$/
export function toArrayPath<T>(p: StringPath<T>) {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment)
}
