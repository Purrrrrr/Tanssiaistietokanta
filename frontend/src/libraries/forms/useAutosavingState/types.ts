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
export type Mergeable = MergeableScalar | MergeableObject | Entity[]

export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT' | 'INVALID'
export interface MergeResult<T> {
  state: SyncState
  conflicts: ArrayPath<T>[]
  patch: Operation[]

  nonConflictingModifications: T //The version that can be sent to the server without breaking stuff because of conflicts
  modifications: T //Local version, including conflicts
  //modifiedPaths?: ArrayPath<T>[]
  //conflictingPaths?: ArrayPath<T>[]
}

export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  from?: string
  path: string
  value?: Mergeable
}

export interface MergeData<T> {
  server: T,
  original: T,
  local: T,
}

export function mapMergeData<T, R>(data: MergeData<T>, mapper: (t: T) => R): MergeData<R> {
  return {
    local: mapper(data.local),
    server: mapper(data.server),
    original: mapper(data.original),
  }
}

export type MergeFunction = <T extends Mergeable>(data: MergeData<T>) => MergeResult<T>
