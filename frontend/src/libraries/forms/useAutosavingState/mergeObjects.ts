import {ChangeSet, MergeableObject, MergeData, MergeFunction, MergeResult, ObjectChangeSet, SyncState} from './types'

export function mergeObjects<T extends MergeableObject>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const modifications : T = { ...data.original }
  const nonConflictingModifications: T = { ...data.original }

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  const changeMap : ObjectChangeSet<T>['changes'] = {}
  for (const key of keys) {
    const dataInKey = indexMergeData(data, key)
    const subResult = merge(dataInKey)
    if (subResult.changes !== null) changeMap[key] = subResult.changes

    switch (subResult.state) {
      case 'CONFLICT':
      {
        modifications[key] = subResult.modifications
        nonConflictingModifications[key] = subResult.nonConflictingModifications
        hasConflicts = true
        break
      }
      case 'MODIFIED_LOCALLY':
        modifications[key] = subResult.modifications
        nonConflictingModifications[key] = subResult.nonConflictingModifications
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
    modifications,
    nonConflictingModifications,
    changes: state === 'IN_SYNC' ? null : {
      type: 'object',
      changes: changeMap,
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
