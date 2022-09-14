import deepEquals from 'fast-deep-equal'
import {mergeArrays} from './mergeArrays'
import {mergeObjects} from './mergeObjects'
import {mergeConflictingStrings} from './mergeStrings'
import {SyncState, MergeData, MergeResult} from './types'

export default function merge<T>(data : MergeData<T>) : MergeResult<T> {
  if (isArrayMerge(data)) {
    return mergeArrays(data, merge) as unknown as MergeResult<T>
  }
  if (typeof data.original === 'object' && data.original !== null) {
    return mergeObjects(data, merge)
  }

  const {local, key} = data
  const state = getMergeState(data)

  const result = {
    state,
    pendingModifications: local,
    conflicts: [],
  }
  if (state !== 'CONFLICT') {
    return result
  }

  if (isStringMerge(data)) {
    return mergeConflictingStrings(data) as unknown as MergeResult<T>
  }

  return {
    state: 'CONFLICT',
    pendingModifications: local,
    conflicts: [key],
  }
}

function isArrayMerge(data : MergeData<any>) : data is MergeData<any[]> {
  return Array.isArray(data.original)
}

function isStringMerge(data : MergeData<any>) : data is MergeData<string> {
  return typeof data.original === 'string'
}

function getMergeState<T>(
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



