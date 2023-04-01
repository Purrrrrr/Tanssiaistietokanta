import deepEquals from 'fast-deep-equal'

import {Entity, Mergeable, MergeableAs, MergeableObject, MergeData, MergeResult, scalarConflict, SyncState} from '../types'
import {mergeArrays} from './mergeArrays'
import {mergeObjects} from './mergeObjects'
import {mergeConflictingStrings} from './mergeStrings'

export default function merge<T extends Mergeable>(data : MergeData<T>) : MergeResult<T> {
  if (nonNullData(data)) {
    if (isMergeableAsArray(data)) {
      return mergeArrays(asCompleteMergeData<Entity[]>(data, []), merge) as unknown as MergeResult<T>
    }
    if (isMergeableAsObjects(data)) {
      return mergeObjects(asCompleteMergeData<MergeableObject>(data, {}), merge) as unknown as MergeResult<T>
    }
  }

  const {local, server} = data
  const state = getMergeState(data)
  const inSync = state === 'IN_SYNC'
  const modifications = inSync ? data.server : local

  const result = {
    state,
    modifications,
    nonConflictingModifications: modifications,
    conflicts: [],
  }
  if (state !== 'CONFLICT') {
    return result
  }

  if (isMergeableAsStrings(data)) {
    return mergeConflictingStrings(asCompleteMergeData<string>(data, '')) as unknown as MergeResult<T>
  }

  return {
    state: 'CONFLICT',
    modifications: local,
    nonConflictingModifications: server,
    conflicts: [
      scalarConflict(data)
    ],
  }
}

function nonNullData(data : MergeData<Mergeable>) : boolean {
  return /* data.original != null && */ data.server != null && data.local != null
}

function isMergeableAsArray(data : MergeData<Mergeable>) : data is MergeableAs<Entity[]> {
  return isMergeableAs(Array.isArray, data)
}

function isMergeableAsObjects(data : MergeData<Mergeable>) : data is MergeableAs<Entity> {
  return isMergeableAs(value => typeof value === 'object' && !Array.isArray(value), data)
}

function isMergeableAsStrings(data : MergeData<Mergeable>) : data is MergeableAs<string> {
  return isMergeableAs(value => typeof value === 'string', data)
}

function isMergeableAs(predicate: (v: unknown) => boolean, data: MergeData<Mergeable>): boolean {
  return (predicate(data.original) || isNullish(data.original))
    && predicate(data.server)
    && predicate(data.local)
}

function isNullish(value: unknown): boolean {
  return value === null || value === undefined
}

function asCompleteMergeData<T>(partialData: MergeableAs<T>, defaultValue: T): MergeData<T> {
  if (partialData.original !== null && partialData.original !== undefined) {
    return partialData as MergeData<T>
  }

  return {
    ...partialData,
    original: partialData.original ?? defaultValue
  }
}

function getMergeState<T extends Mergeable>(
  {server, original, local} : MergeData<T>
) : SyncState {
  const modifiedLocally = !deepEquals(original, local)
  if (!modifiedLocally) {
    return 'IN_SYNC'
  }

  const modifiedOnServer = !deepEquals(original, server)
  const conflict = !deepEquals(server, local)

  if (!modifiedOnServer) { //& modified locally
    return 'MODIFIED_LOCALLY'
  }
  if (!conflict) { // Both have same modifications
    return 'IN_SYNC'
  }

  return 'CONFLICT'
}

