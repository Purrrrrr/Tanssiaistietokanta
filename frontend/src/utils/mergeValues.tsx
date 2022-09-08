import deepEquals from 'fast-deep-equal'
import {merge as merge3} from 'node-diff3'
import {getArrayChanges, mapToIds, Change} from './arrayDiff'

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
export function mergeArrays<T>(
  data: MergeData<T[]>
) : MergeResult<T[]> {
  const serverDiff = getArrayChanges(data.originalValue, data.serverValue)
  const localDiff = getArrayChanges(data.originalValue, data.localValue)

  let { conflicts, pendingModifications } = mergeDeletes(data.originalValue, serverDiff, localDiff);

  ({ conflicts, pendingModifications } = mergeMoves(pendingModifications, serverDiff, localDiff, conflicts))

  const additionIndexes = new Set<number>()
  localDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to + countInSet(conflicts, key => key <= change.to)
      pendingModifications.splice(toIndex, 0, change.originalVersion)
      additionIndexes.add(toIndex)
    })

  //TODO: handle two similar adds as one
  serverDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to
        + countInSet(conflicts, key => key <= change.to)
        + countInSet(additionIndexes, key => key <= change.to)
      pendingModifications.splice(toIndex, 0, change.originalVersion)
    })

  return {
    state: conflicts.size > 0 ? 'CONFLICT' : 'IN_SYNC', //TODO: THIS IS SPART... WRONG
    pendingModifications: pendingModifications,
    conflicts: Array.from(conflicts).map(key => data.key+"/"+key),
  }
}
// @ts-ignore
window.mergeArrays = mergeArrays

function mergeDeletes<T>(originalValue: T[], serverDiff: Change<T>[], localDiff: Change<T>[]) : { pendingModifications: T[], conflicts: Set<number> } {
  const serverChanges = new Map(
    serverDiff
      .filter(change => change.status !== 'ADDED')
      .map(change => [change.from, change])
  )
  const localChanges = new Map(
     localDiff 
      .filter(change => change.status !== 'ADDED')
      .map(change => [change.from, change])
  )

  const deletedKeys = new Set()
  const conflictedKeys = new Set<number>()
  originalValue.forEach((value, index) => {
    const serverStatus = serverChanges.get(index)!.status
    const localStatus = localChanges.get(index)!.status
    const removedOnServer = serverStatus === 'REMOVED'
    const removedOnLocal = localStatus === 'REMOVED'

    if (!removedOnServer && !removedOnLocal) return
    if (removedOnServer) {
      if (removedOnLocal || localStatus === 'UNCHANGED') {
        deletedKeys.add(index)
        return
      }
    }
    //Removed on local
    if(serverStatus === 'UNCHANGED') {
      deletedKeys.add(index)
      return
    }

    conflictedKeys.add(index)
  })

  return {
    pendingModifications: originalValue.filter((_, index) => !deletedKeys.has(index)),
    conflicts: conflictedKeys,
  }
}

function mergeMoves<T>(originalValue: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : { pendingModifications: T[], conflicts: Set<number> } {
  if (conflicts.size > 0) {
    return {
      pendingModifications: originalValue,
      conflicts,
    }
  }

  const originalIds = mapToIds(originalValue)
  const serverChangesById = new Map(
    serverDiff.map(change => [change.id, change])
  )
  const localChangesById = new Map(
    localDiff.map(change => [change.id, change])
  )

  const conflictedKeys = new Set<number>()
  const moves = new Map<any,number>()
  originalIds.forEach((id, index) => {
    const serverChange = serverChangesById.get(id)
    const localChange = localChangesById.get(id)!

    if (serverChange !== undefined && isMove(serverChange)) {
      if(localChange.moveAmount === 0) {
        moves.set(id, serverChange.moveAmount)
      } else {
        conflictedKeys.add(index)
      }
    }
    if (isMove(localChange)) {
      if(serverChange === undefined || serverChange.moveAmount === 0) {
        moves.set(id, localChange.moveAmount)
      } else {
        conflictedKeys.add(index)
      }
    }
  })

  console.log(moves)
  
  const moved = originalIds
    .map((id, index) => {
      const value = originalValue[index]
      if (moves.has(id)) {
        const move = moves.get(id)!
        const half = move > 0 ? 0.5 : -0.5
        return {index: index+move+half, id, value}
      }
      return {index, id, value}
    })
    .sort((a,b) => a.index - b.index)
    .map(i => i.value)
  console.log(moved)
  console.log(conflictedKeys)

  return {
    pendingModifications: moved,
    conflicts: conflictedKeys,
  }
}

function isMove(change: Change<any>): boolean {
  return (change.status === 'MOVED' || change.status === 'MOVED_AND_MODIFIED') && change.moveAmount !== 0
}

function countInSet<T>(set: Set<T>, filter: (i: T) => boolean) : number {
  let count = 0
  set.forEach(item => {
    if(filter(item)) count++
  })
  return count
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
