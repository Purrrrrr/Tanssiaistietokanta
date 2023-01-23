// import deepEquals from 'fast-deep-equal'
import deepEquals from 'fast-deep-equal'

import {Entity, ID, mapMergeData, MergeData, MergeFunction, MergeResult, SyncState } from './types'

import {ArrayPath} from '../types'
import { areEqualWithoutId, mapToIds } from './idUtils'
import {GTSort} from './mergeGraph'
import merge from './mergeValues'
import {emptyPath, subIndexPath} from './pathUtil'

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
      getValue: (id: ID) => idToData.get(id)?.value,
    }
  })

  const allExistingIds = new Set([
    ...data.local.ids.filter(id => data.server.has(id) || !data.original.has(id)),
    ...data.server.ids.filter(id => data.local.has(id) || !data.original.has(id)),
  ])

  const conflicts : ArrayPath<T[]>[] = []
  const mergedValues = new Map<ID, T>()
  const nonConflictingMergedValues = new Map<ID, T>()
  const modifiedIds = new Set<ID>()
  const conflictingIds = new Set<ID>()

  data.local.ids.forEach(id => {
    const serverData = data.server.getData(id)
    const original = data.original.getValue(id)
    const local = data.local.getValue(id)

    if (!local) return
    if (!serverData || !original) {
      if (original && !deepEquals(original, local)) {
        conflictingIds.add(id)
      }
      mergedValues.set(id, local)
      nonConflictingMergedValues.set(id, local)
      return
    }
    const server = serverData.value

    const result = merge<T>({ original, local, server})
    switch(result.state) {
      case 'MODIFIED_LOCALLY':
        modifiedIds.add(id)
        mergedValues.set(id, result.modifications)
        nonConflictingMergedValues.set(id, result.modifications)
        break
      case 'IN_SYNC':
        mergedValues.set(id, result.modifications)
        nonConflictingMergedValues.set(id, result.modifications)
        break
      case 'CONFLICT':
      {
        const subConflicts : ArrayPath<T[]>[] = result.conflicts
          .map(conflict => subIndexPath(serverData.index, conflict))
        conflicts.push(...subConflicts)
        conflictingIds.add(id)
        mergedValues.set(id, result.modifications)
        nonConflictingMergedValues.set(id, result.nonConflictingModifications)
        break
      }
    }
  })

  data.server.ids.forEach((id, index) => {
    if (data.original.has(id)) return
    const server = data.server.getValue(id)
    if (!server) return //Should not happen

    //Values is added on server. Compute and check if a matching addition has been made locally. Count matching additions by position from the end

    const indexFromEnd = data.server.ids.length - index
    const matchingLocalIndex = data.local.ids.length - indexFromEnd
    const matchingLocalId = data.local.ids[matchingLocalIndex]
    const hasDuplicateAddition = !data.original.has(matchingLocalId) && areEqualWithoutId(server, mergeData.local[matchingLocalIndex])

    if (hasDuplicateAddition) {
      data.local.ids[matchingLocalIndex] = id
    }
    mergedValues.set(id, server)
    nonConflictingMergedValues.set(id, server)
  })

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

  if (hasStructuralConflict) conflicts.push(emptyPath<T[]>())

  function getFromMap(map: Map<ID, T>, id: ID): T{
    const val = map.get(id)
    if (!val) throw new Error('Unknown merged id '+id)
    return val
  }
  return {
    state,
    modifications: localVersion.map(id => getFromMap(mergedValues, id)),
    nonConflictingModifications: serverVersion.map(id => getFromMap(nonConflictingMergedValues, id)),
    conflicts,
    patch: [],
  }
}