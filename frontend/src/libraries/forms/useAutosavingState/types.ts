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
  changes: ChangeSet<T> | null
}

export type ChangeSet<T> = T extends (infer B)[]
  ? ArrayChangeSet<B>
  : T extends object
    ? ObjectChangeSet<T>
    : PlainChangeSet<T>

export interface PlainChangeSet<T> {
  type: 'scalar'
  changedValue: T
  conflictingLocalValue?: T
}
export function scalarChange<T>(changedValue: T): PlainChangeSet<T> {
  return { type: 'scalar', changedValue }
}
export function conflictingScalarChange<T>({local, server}: {local: T, server: T}): PlainChangeSet<T> {
  return { type: 'scalar', changedValue: server, conflictingLocalValue: local }
}

export interface ObjectChangeSet<T> {
  type: 'object'
  // If there are conflicts, they are inside the changes OR this changeset becomes a scalar changeset
  changes: { [K in (keyof T)]?: ChangeSet<T[K]> }
}
export function objectChange<T>(changes: ObjectChangeSet<T>['changes']): ObjectChangeSet<T> {
  return { type: 'object', changes }
}
export interface ArrayChangeSet<T> {
  type: 'array'
  itemModifications: Map<ID, ChangeSet<T>>
  addedItems: Map<ID, T> //Where and what stuff has been added locally
  originalStructure: ID[]
  modifiedStructure?: ID[]
  conflictingLocalStructure?: ID[]
}
export function arrayChange<T>(changes: Map<ID, ChangeSet<T>>, originalStructure: ID[], modifiedStructure?: ID[], added?: Map<ID, T>): ArrayChangeSet<T> {
  return {
    type: 'array',
    itemModifications: changes,
    addedItems: added ?? new Map(),
    originalStructure,
    modifiedStructure,
  }
}
export function conflictingArrayChange<T>(changes: Map<ID, ChangeSet<T>>, structure: {original: ID[], local: ID[], server: ID[]}, added?: Map<ID, T>): ArrayChangeSet<T> {
  return {
    type: 'array',
    itemModifications: changes,
    addedItems: added ?? new Map(),
    originalStructure: structure.original,
    modifiedStructure: structure.server,
    conflictingLocalStructure: structure.local,
  }
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
