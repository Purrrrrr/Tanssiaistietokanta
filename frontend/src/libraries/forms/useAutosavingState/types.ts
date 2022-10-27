import { ArrayPath as Path, PropertyAtPath } from '../types'

export type { Path, PropertyAtPath }

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
