import {MergeableObject, MergeData, MergeFunction, MergeResult, Operation, SyncState} from './types'

import {ArrayPath} from '../types'
import {scopePatch} from './patch'
import {subPath} from './pathUtil'

export function mergeObjects<T extends MergeableObject>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const conflicts : ArrayPath<T>[] = []
  const pendingModifications : T = { ...data.original }

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
        pendingModifications[key] = subResult.pendingModifications
        hasConflicts = true
        break
      }
      case 'MODIFIED_LOCALLY':
        pendingModifications[key] = subResult.pendingModifications
        patch.push(
          ...scopePatch(String(key), subResult.patch)
        )
        hasModifications = true
        break
      case 'IN_SYNC':
        pendingModifications[key] = data.server[key]
    }
  }

  let state : SyncState = 'IN_SYNC'
  if (hasConflicts) state = 'CONFLICT'
  else if (hasModifications) state = 'MODIFIED_LOCALLY'

  return {
    state,
    pendingModifications,
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
