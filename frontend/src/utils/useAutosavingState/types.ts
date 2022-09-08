export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
export interface MergeResult<T> {
  state: SyncState
  pendingModifications: T
  conflicts: string[]
}

export interface MergeData<T> {
  key: string,
  server: T,
  original: T,
  local: T
}

export type MergeFunction = <T>(data: MergeData<T>) => MergeResult<T>
