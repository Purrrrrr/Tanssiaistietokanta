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
  server: T,
  original: T,
  local: T
}

export type SuperPartial<T> = {
  [k in (keyof T)]?: SuperPartial<T[k]>
} | undefined

export default function merge<T>(data : MergeData<T>) : MergeResult<T> {
  if (isArrayMerge(data)) {
    return mergeArrays(data) as unknown as MergeResult<T>
  }
  if (typeof data.original === 'object' && data.original !== null) {
    return mergeObjects(data)
  }

  const {local, key} = data
  const state = getMergeState(data)

  const result = {
    state,
    conflicts: [],
  }
  if (state === 'MODIFIED_LOCALLY') {
    return {
      pendingModifications: local,
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

  const modifiedLocally = local !== undefined && !deepEquals(original, local)
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
  {server, original, local, key} : MergeData<string>
) : MergeResult<string> {
  const { conflict, result } = merge3(server, original, local, {stringSeparator: "\n"})
  
  if (!conflict) {
    return {
      state: 'MODIFIED_LOCALLY',
      pendingModifications: result.join("\n"),
      conflicts: [],
    }
  }

  return {
    state: 'CONFLICT',
    pendingModifications: local,
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
    server: mapper(data.server),
    original: mapper(data.original),
    local: mapper(data?.local),
    key: keyMapper(data.key),
  }
}

function getAllKeys<T>(data: MergeData<T>): (keyof T)[] {
  return Array.from(new Set([
    ...Object.keys(data.server),
    ...Object.keys(data.original),
    ...Object.keys(data.local ?? {}),
  ])) as (keyof T)[]

}
