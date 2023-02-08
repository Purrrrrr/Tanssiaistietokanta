import deepEquals from 'fast-deep-equal'

import {ChangeSet, conflictingScalarChange, Entity, Mergeable, MergeData, MergeResult, scalarChange, SyncState} from './types'

import {mergeArrays} from './mergeArrays2'
import {mergeObjects} from './mergeObjects'
import {mergeConflictingStrings} from './mergeStrings'

export default function merge<T extends Mergeable>(data : MergeData<T>) : MergeResult<T> {
  if (nonNullData(data)) {
    if (isArrayMerge(data)) {
      return mergeArrays(data, merge) as unknown as MergeResult<T>
    }
    if (isObjectMerge(data)) {
      return mergeObjects(data, merge) as unknown as MergeResult<T>
    }
  }

  const {local} = data
  const state = getMergeState(data)
  const inSync = state === 'IN_SYNC'
  const modifications = inSync ? data.server : local

  const result = {
    state,
    modifications,
    nonConflictingModifications: modifications,
    changes: inSync
      ? null
      : scalarChange(modifications) as ChangeSet<T>
  }
  if (state !== 'CONFLICT') {
    return result
  }

  if (isStringMerge(data)) {
    return mergeConflictingStrings(data) as unknown as MergeResult<T>
  }

  return {
    state: 'CONFLICT',
    modifications: local,
    nonConflictingModifications: data.server,
    changes: conflictingScalarChange({server: data.server, local}) as ChangeSet<T>
  }
}

function nonNullData(data : MergeData<Mergeable>) : boolean {
  return data.original != null && data.server != null && data.local != null
}

function isArrayMerge(data : MergeData<Mergeable>) : data is MergeData<Entity[]> {
  return Array.isArray(data.original)
    && Array.isArray(data.server)
    && Array.isArray(data.local)
}

function isObjectMerge(data : MergeData<Mergeable>) : data is MergeData<Entity> {
  return typeof data.original === 'object' && !Array.isArray(data.original)
    && typeof data.server === 'object' && !Array.isArray(data.server)
    && typeof data.local === 'object' && !Array.isArray(data.local)
}

function isStringMerge(data : MergeData<Mergeable>) : data is MergeData<string> {
  return typeof data.original === 'string'
    && typeof data.server === 'string'
    && typeof data.local === 'string'
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



