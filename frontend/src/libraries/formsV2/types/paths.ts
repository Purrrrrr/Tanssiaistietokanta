import { AnyType, TypedPath } from 'libraries/common/paths'

import type { ListItem } from '../components/dnd'

export type { AnyType } from 'libraries/common/paths'

export type { ListItem }
export type GenericPath = string | number
export type DataPath<T, Data> = FieldPath<T, T, Data>
export type FieldPath<Input, Output, Data, Depth extends number = 8> =
  TypedPath<Input, Output, Data, Depth>

export type ListPath<Data> = FieldPath<ListItem[], AnyType, Data> & string

const numberRegex = /^(:?[1-9][0-9]*)|0$/
export function toArrayPath(p: GenericPath): GenericPath[] {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment)
}
