import {ArrayPath} from '../types'

export type ID = string | number
export interface MergeableObject {
  [key: string]: Mergeable
}
export interface Entity {
  _id: ID
  [key: string]: Mergeable
}
export type MergeableScalar  = undefined | null | string | number | boolean
export type MergeableListItem = Entity | ID
export type Mergeable = MergeableScalar | MergeableObject | MergeableListItem[]

export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT' | 'INVALID'
export interface MergeResult<T extends Mergeable> {
  state: SyncState
  pendingModifications: T
  conflicts: ArrayPath<T>[]
  patch: Operation[]
}

export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  from?: string
  path: string
  value?: Mergeable
}

export interface MergeData<T extends Mergeable> {
  server: T,
  original: T,
  local: T,
}

export type MergeFunction = <T extends Mergeable>(data: MergeData<T>) => MergeResult<T>
