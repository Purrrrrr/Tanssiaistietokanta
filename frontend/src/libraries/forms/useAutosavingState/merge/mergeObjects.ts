import {ConflictPath, Deleted, mapMergeData, MergeableObject, MergeData, MergeFunction, MergeResult, scalarConflict, scopeConflicts, SyncState} from '../types'

export function mergeObjects<T extends MergeableObject>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const modifications : Partial<T> = {}
  const nonConflictingModifications: Partial<T> = {}

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  const conflicts : ConflictPath[] = []
  for (const key of keys) {
    const dataInKey = indexMergeData(data, key)
    const subResult = merge(dataInKey)
    const existsIn = mapMergeData(data, obj => key in obj)

    switch (subResult.state) {
      case 'CONFLICT':
      {
        if (existsIn.local) modifications[key] = subResult.modifications
        if (existsIn.server) nonConflictingModifications[key] = subResult.nonConflictingModifications
        if (existsIn.local && existsIn.server) {
          conflicts.push(...scopeConflicts(key, subResult.conflicts))
        } else {
          conflicts.push(scalarConflict(
            {
              local: existsIn.local ? dataInKey.local : Deleted,
              server: existsIn.server ? dataInKey.server : Deleted,
            }, [String(key)]
          ))
        }
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
    conflicts,
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
