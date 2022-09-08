import {SyncState, MergeData, MergeFunction, MergeResult} from './types'

export function mergeObjects<T extends Object>(
  data : MergeData<T>,
  merge: MergeFunction,
) : MergeResult<T> {
  const conflicts : any[] = []
  const pendingModifications : T = { ...data.original }

  let hasConflicts = false
  let hasModifications = false

  const keys = getAllKeys(data)
  for (const key of keys) {
    const dataInKey = indexMergeData(data, key as keyof T)
    const subResult = merge(dataInKey)

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
    local: mapper(data.local),
    key: keyMapper(data.key),
  }
}

function getAllKeys<T>(data: MergeData<T>): (keyof T)[] {
  return Array.from(new Set([
    ...Object.keys(data.server),
    ...Object.keys(data.original),
    ...Object.keys(data.local),
  ])) as (keyof T)[]
}
