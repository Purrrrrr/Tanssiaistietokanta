export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
export interface MergeResult<T> {
  state: SyncState
  pendingModifications: T
  conflicts: Path<T>[]
}

export interface MergeData<T> {
  server: T,
  original: T,
  local: T,
}

export type Key = string | number | symbol

export type MergeFunction = <T>(data: MergeData<T>) => MergeResult<T>

//export type Path<T> = Key[]
export type Path<Target, DepthCounter extends number = 3> = [] |
  DepthCounter extends never
    ? []
    : Target extends (infer U)[]
      ? [number, ...Path<U, Decrement[DepthCounter]>]
      : Target extends object
        ? ({ [K in keyof Target]-?: K extends string | number ?
          [K, ...Path<Target[K], Decrement[DepthCounter]>]
          : []
        }[keyof Target])
        : []

export type PropertyAtPath<Target, Path extends readonly unknown[]> =
  // Base recursive case, no more paths to traverse
  Path extends []
    // Return target
    ? Target
    // Here we have 1 or more paths to access
    : Path extends [infer TargetPath, ...infer RemainingPaths]
      // Check Target can be accessed via this path
      ? TargetPath extends keyof Target
        // Recurse and grab paths
        ? PropertyAtPath<Target[TargetPath], RemainingPaths>
        // Target path is not keyof Target
        : never
      // Paths could not be destructured
      : never;

export type JoinedPath<A> = Joined<Path<A>>

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
/**/
