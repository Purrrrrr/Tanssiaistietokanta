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
export interface PartialMergeResult<T> {
  state: SyncState
  nonConflictingModifications: T //The version that can be sent to the server without breaking stuff because of conflicts
  modifications: T //Local version, including conflicts
  conflicts: Conflict<unknown>[]
}

export interface MergeResult<T> extends Omit<PartialMergeResult<T>, 'conflicts'> {
  conflicts: ConflictMap<T>
}

export function scalarConflict(data: MergeData<unknown>, path: PathParam = []): Conflict<unknown>{
  return {
    type: 'scalar',
    ...data,
    ...conflictPath(path),
  }
}

export function removedArrayItemConflict(data: MergeData<unknown>, index: number, path: PathParam = []): Conflict<unknown>{
  return {
    type: 'removedArrayItem',
    index,
    ...data,
    ...conflictPath(path),
  }
}

type PathParam = Path | {server: Path, local: Path}
export function conflictPath(path: PathParam = []) {
  if (Array.isArray(path)) {
    return {
      //Copy the other array since we usually modify it
      serverPath: path,
      localPath: path.slice()
    }
  }
  return {
    localPath: path.local,
    serverPath: path.server,
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

export function toFinalMergeResult<T>(result: PartialMergeResult<T>): MergeResult<T> {
  return {
    ...result,
    conflicts: toConflictMap(result.conflicts),
  }
}

function toConflictMap(conflicts: Conflict<unknown>[]): ConflictMap<unknown> {
  conflicts.forEach(c => {
    c.localPath.reverse()
    c.serverPath.reverse()
  })
  return new Map(
    conflicts.map(c => {
      const path = c.localPath.join('.')
      return [
        c.type === 'removedArrayItem'
          ? `${path}.Deleted-${c.index}`
          : path,
        c,
      ]
    })
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

export type MergeFunction = <T extends Mergeable>(data: MergeData<T>) => PartialMergeResult<T>
