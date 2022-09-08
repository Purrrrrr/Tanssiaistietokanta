import deepEquals from 'fast-deep-equal'
import {merge as merge3} from 'node-diff3'
import {mergeArrays} from './mergeArrays'

export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
export interface MergeResult<T> {
  state: SyncState
  pendingModifications?: SuperPartial<T>
  conflicts: string[]
}

export interface MergeData<T> {
  key: string,
  serverValue: T,
  originalValue: T,
  localValue: T
}

export type SuperPartial<T> = {
  [k in (keyof T)]?: SuperPartial<T[k]>
} | undefined

export default function merge<T>(data : MergeData<T>) : MergeResult<T> {
  if (isArrayMerge(data)) {
    return mergeArrays(data) as unknown as MergeResult<T>
  }
  if (typeof data.originalValue === 'object' && data.originalValue !== null) {
    return mergeObjects(data)
  }

  const {localValue, key} = data
  const state = getMergeState(data)

  const result = {
    state,
    conflicts: [],
  }
  if (state === 'MODIFIED_LOCALLY') {
    return {
      pendingModifications: localValue,
      ...result,
    }
  }
  if (state !== 'CONFLICT') {
    return result
  }

  if (isStringMerge(data)) {
    return mergeConflictingStrings(data) as unknown as MergeResult<T>
  }

  return {
    state: 'CONFLICT',
    pendingModifications: localValue,
    conflicts: [key],
  }
}

function isArrayMerge(data : MergeData<any>) : data is MergeData<any[]> {
  return Array.isArray(data.originalValue)
}

function isStringMerge(data : MergeData<any>) : data is MergeData<string> {
  return typeof data.originalValue === 'string'
}

function getMergeState<T>(
  {serverValue, originalValue, localValue} : MergeData<T>
) : SyncState {

  const modifiedLocally = localValue !== undefined && !deepEquals(originalValue, localValue)
  if (!modifiedLocally) {
    return 'IN_SYNC'
  }

  const modifiedOnServer = !deepEquals(originalValue, serverValue)
  const conflict = !deepEquals(serverValue, localValue)

  if (!modifiedOnServer) { //& modified locally
    return 'MODIFIED_LOCALLY'
  }
  if (!conflict) { // Both have same modifications
    return 'IN_SYNC'
  }

  return 'CONFLICT'
}

function mergeObjects<T extends Object>(
  data : MergeData<T>
) : MergeResult<T> {
  const conflicts : any[] = []
  const pendingModifications : SuperPartial<T> = {}

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  for (const key of keys) {
    const partialData = indexMergeData(data, key as keyof T)
    const subResult = merge(partialData)

    switch (subResult.state) {
      case 'CONFLICT':
        conflicts.push(...subResult.conflicts)
        pendingModifications[key] = subResult.pendingModifications
        hasConflicts = true
        break
      case 'MODIFIED_LOCALLY':
        pendingModifications[key] = subResult.pendingModifications
        hasModifications = true
        break
    }
  }

  let state : SyncState = 'IN_SYNC'
  if (hasConflicts) state = 'CONFLICT'
  else if (hasModifications) state = 'MODIFIED_LOCALLY'

  return {
    state,
    pendingModifications,
    conflicts,
  }
}
function mergeConflictingStrings(
  {serverValue, originalValue, localValue, key} : MergeData<string>
) : MergeResult<string> {
  const { conflict, result } = merge3(serverValue, originalValue, localValue, {stringSeparator: "\n"})
  
  if (!conflict) {
    return {
      state: 'MODIFIED_LOCALLY',
      pendingModifications: result.join("\n"),
      conflicts: [],
    }
  }

  return {
    state: 'CONFLICT',
    pendingModifications: localValue,
    conflicts: [key],
  }
}

function indexMergeData<T>(data : MergeData<T>, key: keyof T) : MergeData<T[typeof key]> {
  return mapMergeData(data, value => value[key], originalKey => originalKey+"/"+key)
}

function mapMergeData<T,X>(
  data : MergeData<T>,
  mapper: (t: T) => X,
  keyMapper: (key: string) => string = key => key
) : MergeData<X> {
  return {
    serverValue: mapper(data.serverValue),
    originalValue: mapper(data.originalValue),
    localValue: mapper(data?.localValue),
    key: keyMapper(data.key),
  }
}

function getAllKeys<T>(data: MergeData<T>): (keyof T)[] {
  return Array.from(new Set([
    ...Object.keys(data.serverValue),
    ...Object.keys(data.originalValue),
    ...Object.keys(data.localValue ?? {}),
  ])) as (keyof T)[]

}
