import type { ListItem } from '../components/dnd'

export type { ListItem }
export type GenericPath = string | number
export type DataPath<T, Data> = FieldPath<T, T, Data>
export type FieldPath<Input, Output, Data, Depth extends number = 8> =
  Data extends AnyType ? GenericPath
  : Joined<FieldArrayPath<Input, Output, Data, Depth>>

export type ListPath<Data> = FieldPath<ListItem[], AnyType, Data> & string

type FieldArrayPath<Input, Output, Data, Depth extends number = 8> =
  Depth extends never ? never
  : (
    (IsFieldFor<Input, Output, Data> extends true ? [] : never)
    | (Data extends (infer U)[]
      ? [number, ...FieldArrayPath<Input, Output, U, Decrement[Depth]>]
      : (Data extends object
          ? Required<{
            [K in (keyof Data)]: [K, ...FieldArrayPath<Input, Output, Data[K], Decrement[Depth]>]
          }>[keyof Data]
          : never)
    )
  )

const _someUnusedSymbol = Symbol()
export type AnyType = typeof _someUnusedSymbol

type IsFieldFor<FieldInput, FieldOutput, Data> =
  And<
    Extends<Data, FieldInput>,
    Extends<FieldOutput, Data>
  >

type Extends<Value, Data> = Value extends Data ? true
  : Value extends AnyType
    ? true
    : Data extends AnyType
      ? true : false

type And<A extends boolean, B extends boolean> = [A, B] extends [true, true] ? true : false

type Joined<Path extends readonly unknown[]> =
  // Base recursive case, no more paths to traverse
  Path extends []
    ? ''
    // Here we have 1 path to access
    : Path extends [infer TargetPath extends string|number]
      ? TargetPath
      // Here we have 1 or more paths to access
      : Path extends [infer TargetPath extends string|number, ...infer RemainingPaths]
        // Recurse and grab paths
        ? `${TargetPath}.${Joined<RemainingPaths>}`
        // Paths could not be destructured
        : never;

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

const numberRegex = /^(:?[1-9][0-9]*)|0$/
export function toArrayPath(p: GenericPath): GenericPath[]  {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment)
}
