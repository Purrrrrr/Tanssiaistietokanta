import {MergeableObject, MergeData, MergeFunction, MergeResult, Operation, SyncState} from './types'

import {ArrayPath} from '../types'
import {scopePatch} from './patch'
import {subPath} from './pathUtil'

export function mergeObjects<T extends MergeableObject>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const conflicts : ArrayPath<T>[] = []
  const modifications : T = { ...data.original }
  const nonConflictingModifications: T = { ...data.original }

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  const patch : Operation[] = []
  for (const key of keys) {
    const dataInKey = indexMergeData(data, key)
    const subResult = merge(dataInKey)

    switch (subResult.state) {
      case 'CONFLICT':
      {
        const subConflicts : ArrayPath<T>[] = subResult.conflicts
          .map(conflict => subPath(key, conflict))
        conflicts.push(...subConflicts)
        modifications[key] = subResult.modifications
        nonConflictingModifications[key] = subResult.nonConflictingModifications
        hasConflicts = true
        break
      }
      case 'MODIFIED_LOCALLY':
        modifications[key] = subResult.modifications
        nonConflictingModifications[key] = subResult.nonConflictingModifications
        patch.push(
          ...scopePatch(String(key), subResult.patch)
        )
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
    conflicts,
    patch,
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
