import deepEquals from 'fast-deep-equal'
import {mergeArrays} from './mergeArrays'
import {mergeObjects} from './mergeObjects'
import {mergeConflictingStrings} from './mergeStrings'
import {SyncState, MergeData, MergeResult} from './types'
import {emptyPath} from './pathUtil'

export default function merge<T>(data : MergeData<T>) : MergeResult<T> {
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

  const result = {
    state,
    pendingModifications: state === 'IN_SYNC' ? data.server :  local,
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
    conflicts: [
      emptyPath(),
    ],
  }
}

function nonNullData(data : MergeData<any>) : boolean {
  return data.original != null && data.server != null && data.local != null
}

function isArrayMerge(data : MergeData<any>) : data is MergeData<any[]> {
  return Array.isArray(data.original)
    && Array.isArray(data.server)
    && Array.isArray(data.local)
}

function isObjectMerge(data : MergeData<any>) : data is MergeData<object> {
  return typeof data.original === 'object' && !Array.isArray(data.original)
    && typeof data.server === 'object' && !Array.isArray(data.server)
    && typeof data.local === 'object' && !Array.isArray(data.local)
}

function isStringMerge(data : MergeData<any>) : data is MergeData<string> {
  return typeof data.original === 'string'
    && typeof data.server === 'string'
    && typeof data.local === 'string'
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



