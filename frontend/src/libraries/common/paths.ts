export type ReadPath<T, D> = TypedPath<D, never, T>
export type WritePath<T, D> = TypedPath<unknown, D, T>

// TypedPath<number, never, SomeType> gets all paths that contain values that can be assigned to number typed variables
// TypedPath<unknown, number, SomeType> gets all paths where we can assign numbers
// TypedPath<unknown, never, SomeType> gets all paths that contain any typed values
export type TypedPath<SupertypeBound, SubtypeBound, Data, Depth extends number = 8> =
  Data extends AnyType ? GenericPath
  : Joined<TypedArrayPath<SupertypeBound, SubtypeBound, Data, Depth>>
// Escape hatch for any type
export type AnyType = typeof _someUnusedSymbol
export type GenericPath = string | number

const _someUnusedSymbol = Symbol()

type TypedArrayPath<SupertypeBound, SubtypeBound, Data, Depth extends number = 8> =
  Depth extends never ? never
  : (
    (IsAssignable<SupertypeBound, SubtypeBound, Data> extends true ? [] : never)
    | (Data extends (infer U)[]
      ? [number, ...TypedArrayPath<SupertypeBound, SubtypeBound, U, Decrement[Depth]>]
      : (Data extends object
          ? Required<{
            [K in (keyof Data)]: [K, ...TypedArrayPath<SupertypeBound, SubtypeBound, Data[K], Decrement[Depth]>]
          }>[keyof Data]
          : never)
    )
  )

type IsAssignable<SupertypeBound, SubtypeBound, Data> =
  And<
    Extends<Data, SupertypeBound>,
    Extends<SubtypeBound, Data>
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
    : Path extends [infer TargetPath extends string | number]
      ? TargetPath
      // Here we have 1 or more paths to access
      : Path extends [infer TargetPath extends string | number, ...infer RemainingPaths]
        // Recurse and grab paths
        ? `${TargetPath}.${Joined<RemainingPaths>}`
        // Paths could not be destructured
        : never

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]
