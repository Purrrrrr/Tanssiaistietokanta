import { Conflict, ConflictMap } from '../types'

export { Deleted } from '../types'

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
  nonConflictingModifications: T //The version that can be sent to the server without breaking stuff because of conflicts
  modifications: T //Local version, including conflicts
  conflicts: ConflictPath[]
}

export interface ConflictPath {
  path: string[]
  conflict: Conflict<unknown>
}

export function scalarConflict({local, server}, path : string[] = []): ConflictPath {
  return {
    path,
    conflict: { type: 'scalar', local, server }
  }
}

export function scopeConflicts(path: string | number | symbol, conflicts: ConflictPath[]) {
  for(const c of conflicts) {
    c.path.push(String(path))
  }
  return conflicts
}

export function toConflictMap(conflicts: ConflictPath[]): ConflictMap<unknown> {
  return new Map(
    conflicts.map(c => [c.path.reverse().join('.'), c.conflict])
  )
}

export interface MergeData<T> {
  server: T,
  original: T,
  local: T,
}

export interface MergeableAs<T> {
  server: T,
  original: T | undefined | null,
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
