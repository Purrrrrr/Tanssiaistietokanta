import { Conflict, ConflictMap, Path, PathComponent } from '../types'

export type { Conflict } from '../types'
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
  conflicts: Conflict<unknown>[]
}

export function scalarConflict(data: MergeData<unknown>, path : Path | {server: Path, local: Path} = []): Conflict<unknown>{
  if (Array.isArray(path)) {
    return scalarConflict(data, {server: path, local: path.slice()})
  }
  return {
    type: 'scalar',
    localPath: path.local,
    serverPath: path.server, //Copy the array since we may modify it
    ...data,
  }
}

export function scopeConflicts<T>(
  path: PathComponent | { server: PathComponent, local: PathComponent },
  conflicts: Conflict<T>[]
): Conflict<T>[] {
  if (typeof path !== 'object') return scopeConflicts({server: path, local: path}, conflicts)
  for(const c of conflicts) {
    c.localPath.push(path.local)
    c.serverPath.push(path.server)
  }
  return conflicts
}

export function toConflictMap(conflicts: Conflict<unknown>[]): ConflictMap<unknown> {
  conflicts.forEach(c => {
    c.localPath.reverse()
    c.serverPath.reverse()
  })
  return new Map(
    conflicts.map(c => [c.localPath.join('.'), c])
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
