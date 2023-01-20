// import deepEquals from 'fast-deep-equal'
import deepEquals from 'fast-deep-equal'

import {Entity, ID, mapMergeData, MergeData, MergeFunction, MergeResult, SyncState } from './types'

import { mapToIds } from './idUtils'
import {GTSort} from './mergeGraph'
import merge from './mergeValues'

// eslint-disable-next-line
/* @ts-ignore */
window.m = function(t) {
  return mergeArrays(
    mapMergeData(t, (l: string[]) => l.map(i => ({_id: i, value: i}))),
    merge
  )
}

export function mergeArrays<T extends Entity>(
  mergeData: MergeData<T[]>,
  merge: MergeFunction,
) : MergeResult<T[]> {
  const data = mapMergeData(mergeData, values => {
    const ids = mapToIds(values)
    const idToData = new Map(
      ids.map((id, index) =>
        [
          id,
          {
            value: values[index],
            index,
          }
        ]
      )
    )
    return {
      ids,
      has: idToData.has.bind(idToData),
      getData: idToData.get.bind(idToData),
      getValue: (id) => idToData.get(id)?.value,
    }
  })

  const addedIds = new Set([
    ...data.local.ids.filter(id => !data.original.has(id)),
    ...data.server.ids.filter(id => !data.original.has(id)),
  ])
  const allExistingIds = new Set([
    ...data.local.ids.filter(id => data.server.has(id) || !data.original.has(id)),
    ...data.server.ids.filter(id => data.local.has(id) || !data.original.has(id)),
  ])

  const mergedValues = new Map<ID, T>()
  const modifiedIds = new Set<ID>()
  const conflictingIds = new Set<ID>()

  data.local.ids.forEach(id => {
    const server = data.server.getValue(id)
    const original = data.original.getValue(id)
    const local = data.local.getValue(id)

    if (!local) return
    if (!server || !original) {
      if (original && !deepEquals(original, local)) {
        conflictingIds.add(id)
      }
      mergedValues.set(id, local)
      return
    }

    const result = merge<T>({ original, local, server})
    switch(result.state) {
      case 'MODIFIED_LOCALLY':
        modifiedIds.add(id)
        mergedValues.set(id, result.pendingModifications)
        break
      case 'IN_SYNC':
        mergedValues.set(id, result.pendingModifications)
        break
      case 'CONFLICT':
        conflictingIds.add(id)
        mergedValues.set(id, result.pendingModifications)
        break
    }
  })

  data.server.ids.forEach(id => {
    if (data.original.has(id)) return
    const server = data.server.getValue(id)
    if (!server) return //Should not happen

    //Added on server
    mergedValues.set(id, server)
  })

  // TODO: do something to entries that are both modified and deleted?
  // TODO: compute duplicate additions
  //
  const shouldExist = allExistingIds.has.bind(allExistingIds)
  const {localVersion, serverVersion} = GTSort(
    mapMergeData(data, ({ids}) =>
      ids
        .filter(id => allExistingIds.has(id) || conflictingIds.has(id))
        .map(id => ({
          id,
          removedInOtherVersion: !allExistingIds.has(id),
          isAdded: !data.original.has(id),
        }))
    )
  )


  /*
  GTSort handles:
    concurrent moving
    deleting
  We need to handle:
    modification

  Conflicts:
    modification+delete?
   */

  const hasStructuralChanges = !deepEquals(localVersion, data.server.ids)
  const hasStructuralConflict = !deepEquals(localVersion, serverVersion)
  const isModified = hasStructuralChanges || modifiedIds.size  > 0
  let state : SyncState = isModified ? 'MODIFIED_LOCALLY' : 'IN_SYNC'
  if (conflictingIds.size > 0 || hasStructuralConflict) state = 'CONFLICT'

  return {
    state,
    pendingModifications: localVersion.map(id => {
      const val = mergedValues.get(id)
      if (!val) throw new Error('Unknown merged id '+id)
      return val
    }),
    conflicts: [],
    patch: [],
  }
}
