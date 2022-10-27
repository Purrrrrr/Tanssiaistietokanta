import {ArrayPath} from '../types'

export type { Path, PropertyAtPath }

export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
export interface MergeResult<T> {
  state: SyncState
  pendingModifications: T
  conflicts: ArrayPath<T>[]
}

export interface MergeData<T> {
  server: T,
  original: T,
  local: T,
}

export type MergeFunction = <T extends Mergeable>(data: MergeData<T>) => MergeResult<T>
