import {ChangeSet, mapMergeData, MergeableObject, MergeData, MergeFunction, MergeResult, ObjectKeyChanges, ObjectKeyRemovals, removedKey, removedOnLocalWithServerModification, removedOnServerWithLocalModification, SyncState} from './types'

export function mergeObjects<T extends MergeableObject>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const modifications : Partial<T> = {}
  const nonConflictingModifications: Partial<T> = {}

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  const changeMap : ObjectKeyChanges<T> = {}
  const additions : Partial<T> = {}
  const removedMap : ObjectKeyRemovals<T> = {}
  for (const key of keys) {
    const dataInKey = indexMergeData(data, key)
    const subResult = merge(dataInKey)
    const existsIn = mapMergeData(data, obj => key in obj)

    const addedInLocal = existsIn.local && !existsIn.server && !existsIn.original
    const removed = (!existsIn.local || !existsIn.server) && existsIn.original

    if (addedInLocal) {
      additions[key] = dataInKey.local
    } else if (removed) {
      if (subResult.state === 'CONFLICT') {
        removedMap[key] = existsIn.local
          ? removedOnServerWithLocalModification(dataInKey.local)
          : removedOnLocalWithServerModification(dataInKey.server)
      } else {
        removedMap[key] = removedKey()
      }
    } else if (subResult.changes !== null) {
      changeMap[key] = subResult.changes
    }

    switch (subResult.state) {
      case 'CONFLICT':
      {
        if (existsIn.local) modifications[key] = subResult.modifications
        if (existsIn.server) nonConflictingModifications[key] = subResult.nonConflictingModifications
        hasConflicts = true
        break
      }
      case 'MODIFIED_LOCALLY':
        if (existsIn.local) {
          modifications[key] = subResult.modifications
          nonConflictingModifications[key] = subResult.nonConflictingModifications
        }
        hasModifications = true
        break
      case 'IN_SYNC':
        modifications[key] = data.server[key]
        nonConflictingModifications[key] = data.server[key]
    }
  }

  let state : SyncState = 'IN_SYNC'
  if (hasConflicts) state = 'CONFLICT'
  else if (hasModifications) state = 'MODIFIED_LOCALLY'

  return {
    state,
    modifications: modifications as T,
    nonConflictingModifications: nonConflictingModifications as T,
    changes: state === 'IN_SYNC' ? null : {
      type: 'object',
      changes: changeMap,
      additions,
      removed: removedMap,
    } as ChangeSet<T>
  }
}

function indexMergeData<T extends MergeableObject>(data : MergeData<T>, key: keyof T) : MergeData<T[typeof key]> {
  return {
    server: get(data.server, key),
    original: get(data.original, key),
    local: get(data.local, key),
  }
}
function get(o, k) {
  return o !== undefined ? o[k] : undefined
}

function getAllKeys<T extends MergeableObject>(data: MergeData<T>): (keyof T)[] {
  return Array.from(new Set([
    ...[data.server, data.original, data.local]
      .map(value => Object.keys(value ?? {}))
      .flat()
      .filter(key => typeof key !== 'symbol')
  ])) as (keyof T)[]
}
