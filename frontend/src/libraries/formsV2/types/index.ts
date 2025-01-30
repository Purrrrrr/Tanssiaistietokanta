import type { ChangeEvent } from 'react'

export type Version = 'SERVER' | 'LOCAL'

export type NewValue<T> = T | ((t: T) => T)
export type OnChangeHandler<T, EventElement = never> = (t: NewValue<T>, event?: ChangeEvent<EventElement>) => unknown

export interface UserGivenFieldContainerProps extends LabelTexts {
  containerClassName?: string
  inline?: boolean
  labelStyle?: LabelStyle
}
export type LabelStyle = 'beside' | 'above' | 'hidden' | 'hidden-nowrapper';

export interface LabelTexts {
  label: string
  helperText?: string
  labelInfo?: string
}

export type TypeAtPath<T, Data> = unknown

export type PathFor<_> = TypedPathFor<AnyType>
export type TypedPathFor<T> = TypedPath<AnyType, T>

export type TypedPath<Type, Data, Depth extends number = 8> =
  Data extends AnyType ? string
  : Joined<TypedArrayPath<Type, Data, Depth>>

type TypedArrayPath<Type, Data, Depth extends number = 8> =
  Depth extends never ? never
  : (
    (ExtendsType<Type, Data> extends true ? [] : never)
    | (Data extends (infer U)[]
      ? [number, ...TypedArrayPath<Type, U, Decrement[Depth]>]
      : (Data extends object
          ? Required<{
            [K in (keyof Data)]: [K, ...TypedArrayPath<Type, Data[K], Decrement[Depth]>]
          }>[keyof Data]
          : never)
    )
  )

const someSymbol = Symbol()
type AnyType = typeof someSymbol

type ExtendsType<Type, Target> =
  //Type extends AnyType ? true :
  //Target extends AnyType ? true :
  //[{a: Type}, {a: Target}] extends [{a: Target}, {a: Type}] ? true
  [Type, Target] extends [Target, Type] ? true
  : Type extends AnyType ? 1
  : Target extends AnyType ? 2 : 0

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

type T = TypedArrayPath<string | undefined, string | undefined>
type R = ExtendsType<string | number, string | number>


