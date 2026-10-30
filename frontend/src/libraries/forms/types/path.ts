import type { TypedPath } from '@/libraries/common/paths'
import { Nullable } from '@/libraries/formsV2/components/inputs'

export type { ValueAtPath as PropertyAtPath } from '@/libraries/common/accessor'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type AnyList = any[]
export type StringPath<Target, Depth extends number = 8> = TypedPath<unknown, never, Target, Depth>
export type StringPathToList<Target, Depth extends number = 8> = TypedPath<unknown[] | null | undefined, never[], Target, Depth>
export type TypedStringPath<OutputType extends InputType, Target, InputType = Nullable<OutputType>, Depth extends number = 8> = TypedPath<InputType, OutputType, Target, Depth>

const numberRegex = /^(:?[1-9][0-9]*)|0$/
export function toArrayPath<T>(p: StringPath<T>) {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment)
}
