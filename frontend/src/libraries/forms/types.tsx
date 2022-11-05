import React from 'react'

export type ChangeListener = () => unknown
export type NewValue<T> = T | ((t: T) => T)

export type AdditionalPropsFrom<Props> = Omit<Props, keyof FieldComponentProps<unknown>>
export interface FieldComponentProps<T, EventElement = HTMLElement> {
  value: T | undefined | null
  onChange: (t: T, e?: React.ChangeEvent<EventElement>) => unknown
  inline?: boolean
  hasConflict?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
}

export type LabelStyle = 'inline' | 'above' | 'hidden';

export type PartialWhen<Cond extends boolean, T> = Cond extends true ? Partial<T> : T
export type NoRequiredProperties<T extends object> = RequiredProperties<T> extends never ? true : false

type RequiredProperties<T extends object> = Exclude<{
  [K in keyof T]: T extends Record<K, T[K]>
  ? K
  : never
}[keyof T], undefined>

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ArrayPath<Target, Depth extends number = 8> = TypedArrayPath<any, Target, Depth>
export type StringPath<Target, Depth extends number = 8> = TypedStringPath<any, Target, Depth>
export type StringPathToList<Target, Depth extends number = 8> = TypedStringPath<any[], Target, Depth>
/* eslint-enable @typescript-eslint/no-explicit-any */
export type TypedStringPath<Type, Target, Depth extends number = 8> = Joined<TypedArrayPath<Type, Target, Depth>>

// Array paths pointing to those things in type Target that are of type Type or null | undefined
export type TypedArrayPath<Type, Target, Depth extends number = 8> =
  Depth extends never ? never :
  (([Type, Target] extends [Target | null | undefined, Type | null | undefined] ? [] : never)
    | (Target extends (infer U)[]
      ? [number, ...TypedArrayPath<Type, U, Decrement[Depth]>]
      : (Target extends object
          ? Required<{
            [K in (keyof Target)]: [K, ...TypedArrayPath<Type, Target[K], Decrement[Depth]>]
          }>[keyof Target]
          : never)
    )
  )

export type PropertyAtPath<Target, Path extends readonly unknown[] | string | number> =
  Path extends string
  ? PropertyAtStringPath<Target, Path>
  : Path extends keyof Target
    ? Target[Path]
    : Path extends unknown[] ? PropertyAtArrayPath<Target, Path> : never

export type PropertyAtStringPath<Target, Path extends string> =
  // Base recursive case, no more paths to traverse
  Path extends ''
    // Return target
    ? Target
    : Path extends `${infer F}.${infer R}`
      ? PropertyAtStringPath<Idx<Target, F>, R>
      : Idx<Target, Path>

export type Idx<T, K extends string> =
  null extends T
  ? Idx<Exclude<T, null>, K> | null
  : undefined extends T
    ? Idx<Exclude<T, undefined>, K> | undefined
    : K extends keyof T
      ? T[K]
      : K extends `${number}` ? number extends keyof T ? T[number] : never : never;

export type PropertyAtArrayPath<Target, Path extends readonly unknown[]> =
  Path extends []
    ? Target
    : Path extends [infer TargetPath, ...infer RemainingPaths]
      ? TargetPath extends keyof Target
        ? PropertyAtArrayPath<Target[TargetPath], RemainingPaths>
        // Target path is not keyof Target
        : never
      // Paths could not be destructured
      : never;

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

// TODO: implement string path support
export type JoinedPath<A> = Joined<ArrayPath<A>>
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

const numberRegex = /^(:?[1-9][0-9]*)|0$/
export function toArrayPath<T>(p: StringPath<T>): ArrayPath<T> {
  if (p === '') return []
  return String(p)
    .split('.')
    .map(segment => segment.match(numberRegex) ? parseInt(segment, 10) : segment) as ArrayPath<T>
}
