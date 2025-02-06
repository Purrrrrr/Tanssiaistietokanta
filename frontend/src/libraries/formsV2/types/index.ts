import { type Schema } from 'yup'

export interface ValidationProps {
  required?: boolean
  schema?: Schema
}

export type ErrorMap = Record<string, Errors>
export type Errors = string[]

export type PathFor<_> = FieldPath<AnyType, AnyType, AnyType>
export type FieldPath<Input, Output, Data, Depth extends number = 8> =
  Data extends AnyType ? string
  : Joined<FieldArrayPath<Input, Output, Data, Depth>>

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

const someSymbol = Symbol()
type AnyType = typeof someSymbol

type IsFieldFor<FieldInput, FieldOutput, Data> =
  [Data, FieldOutput] extends [FieldInput, Data] ? true
  : Data extends AnyType ? 1
  : [FieldInput, FieldOutput] extends [AnyType, AnyType] ? 2 : 0

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
export function toArrayPath(p: string): (number | string)[]  {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment)
}
