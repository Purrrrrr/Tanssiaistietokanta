import {MergeableListItem, MergeData, MergeFunction, MergeResult, Operation, SyncState} from './types'

import {ArrayPath} from '../types'
import {Change, getArrayChanges} from './arrayDiff'
import { areEqualWithoutId, mapToIds } from './idUtils'
import {scopePatch} from './patch'
import {emptyPath, subIndexPath} from './pathUtil'

interface ArrayMergeResult<T> {
  hasModifications: boolean
  pendingModifications: T[]
  patch: Operation[]
}

export function mergeArrays<T extends MergeableListItem>(
  data: MergeData<T[]>,
  merge: MergeFunction,
) : MergeResult<T[]> {
  const serverDiff = getArrayChanges(data.original, data.server)
  const localDiff = getArrayChanges(data.original, data.local)

  const modifyResult = mergeModifications(data.original, serverDiff, localDiff, merge)
  let { state } = modifyResult

  const indexConflicts = new Set<number>()
  const deleteResult = mergeDeletes(modifyResult.pendingModifications, serverDiff, localDiff, indexConflicts)
  const moveResult = mergeMoves(deleteResult.pendingModifications, serverDiff, localDiff, indexConflicts)
  const addResult = mergeAdditions(moveResult.pendingModifications, serverDiff, localDiff, indexConflicts)

  if (indexConflicts.size > 0) state = 'CONFLICT'
  if (state === 'IN_SYNC' && (deleteResult.hasModifications || moveResult.hasModifications || addResult.hasModifications)) {
    state = 'MODIFIED_LOCALLY'
  }

  const conflicts : ArrayPath<T[]>[] = indexConflicts.size > 0
    ? [emptyPath<T[]>()]
    : modifyResult.conflicts

  return {
    state,
    pendingModifications: addResult.pendingModifications,
    patch: [
      ...modifyResult.patch,
      ...deleteResult.patch,
      ...moveResult.patch,
      ...addResult.patch,
    ],
    conflicts,
  }
}

function mergeModifications<T extends MergeableListItem>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], merge : MergeFunction) : MergeResult<T[]> {
  const modifiedIndexesById = new Map<unknown, number>()
  const pendingModifications = [...original]
  const conflicts : ArrayPath<T[]>[] = []
  const patchesById = new Map<unknown, Operation[]>()
  const serverPositionsById = new Map<unknown, number>(
    serverDiff.map(change => [change.id, change.to])
  )

  localDiff
    .filter(change => ['MODIFIED', 'MOVED_AND_MODIFIED'].includes(change.status))
    .forEach(change => {
      const local = change.changedValue
      const original = change.originalValue
      pendingModifications[change.from] = local
      modifiedIndexesById.set(change.id, change.from)
      const serverPos = serverPositionsById.get(change.id)
      if (serverPos !== undefined) {
        const result = merge({ original, local, server: original})
        patchesById.set(change.id, [
          testOriginalItem(serverPos, local),
          ...scopePatch(String(serverPos), result.patch)
        ])
      }
    })
  serverDiff
    .filter(change => ['MODIFIED', 'MOVED_AND_MODIFIED'].includes(change.status))
    .forEach(change => {
      const server = change.changedValue
      if (modifiedIndexesById.has(change.id)) {
        const originalItem = original[change.from]
        const local = pendingModifications[change.from]
        const result = merge({ original: originalItem, local, server })

        switch(result.state) {
          case 'IN_SYNC':
            modifiedIndexesById.delete(change.id)
            patchesById.delete(change.id)
            break
          case 'MODIFIED_LOCALLY':
            pendingModifications[change.from] = result.pendingModifications
            patchesById.set(change.id, [
              testOriginalItem(change.from, server),
              ...scopePatch(String(change.to), result.patch)
            ])
            break
          case 'CONFLICT':
          {
            const subConflicts : ArrayPath<T[]>[] = result.conflicts
              .map(conflict => subIndexPath(change.from, conflict))
            conflicts.push(...subConflicts)
            patchesById.delete(change.id)
          }
        }
      } else {
        pendingModifications[change.from] = server
      }
    })
  serverDiff
    .filter(change => ['REMOVED'].includes(change.status))
    .forEach(change => patchesById.delete(change.id))

  const patch : Operation[] = Array.from(patchesById.values()).flat()

  let state : SyncState = modifiedIndexesById.size > 0 ? 'MODIFIED_LOCALLY' : 'IN_SYNC'
  if (conflicts.length > 0) state = 'CONFLICT'

  return {
    state,
    pendingModifications: pendingModifications,
    patch,
    conflicts,
  }
}

function mergeDeletes<T extends MergeableListItem>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : ArrayMergeResult<T> {
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
  const serverPositionsById = new Map<unknown, number>(
    serverDiff.map(change => [change.id, change.to])
  )

  const patch : Operation[] = []

  const deletedKeys = new Set()
  let removed = 0
  let hasModifications = false

  original.forEach((value, index) => {
    const localChange = localChanges.get(index)!
    const serverStatus = serverChanges.get(index)!.status
    const localStatus = localChange.status
    const removedOnServer = serverStatus === 'REMOVED'
    const removedOnLocal = localStatus === 'REMOVED'

    if (!removedOnServer && !removedOnLocal) return

    if (removedOnServer) {
      if (removedOnLocal || localStatus === 'UNCHANGED') {
        deletedKeys.add(index)
      } else {
        conflicts.add(index)
      }
      return
    }

    //Removed on local
    hasModifications = true
    deletedKeys.add(index)
    if(serverStatus !== 'UNCHANGED') {
      conflicts.add(index)
    } else {
      const serverPos = serverPositionsById.get(localChange.id)
      if (serverPos !== undefined) {
        patch.push(
          testOriginalItem(serverPos-removed, localChange.originalValue),
          {op: 'remove', path: `/${serverPos-removed}`}
        )
        removed++
      }
    }
  })

  return {
    pendingModifications: original.filter((_, index) => !deletedKeys.has(index)),
    patch,
    hasModifications,
  }
}

function mergeMoves<T extends MergeableListItem>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : ArrayMergeResult<T> {
  if (conflicts.size > 0) {
    return {
      pendingModifications: original,
      patch: [],
      hasModifications: false,
    }
  }
  const patch : Operation[] = []

  const originalIds = mapToIds(original)
  const serverChangesById = new Map(
    serverDiff.map(change => [change.id, change])
  )
  const localChangesById = new Map(
    localDiff.map(change => [change.id, change])
  )
  const serverPositionsById = new Map<unknown, number>(
    serverDiff.map(change => [change.id, change.to])
  )

  const moves = new Map<unknown, number>()
  const addedPositionsById = new Map<unknown, number>()
  const removedPositionsById = new Map<unknown, number>()

  let hasModifications = false
  originalIds.forEach((id, index) => {
    const localChange = localChangesById.get(id)
    if (localChange?.status === 'ADDED') return
    const serverChange = serverChangesById.get(id)
    if (localChange === undefined || serverChange === undefined) throw new Error('This should not happen')

    if (isMove(serverChange)) {
      if(localChange.moveAmount === 0 || localChange.moveAmount === serverChange.moveAmount) {
        moves.set(id, serverChange.moveAmount)
        return
      } else {
        conflicts.add(index)
      }
    }
    if (isMove(localChange)) {
      hasModifications = true
      if(serverChange.moveAmount !== 0) {
        conflicts.add(index)
      } else {
        if (localChange.moveAmount !== -1) {
          const serverPos = serverPositionsById.get(localChange.id)
          if (serverPos !== undefined) {
            const from = serverPos + countIn(addedPositionsById, pos => pos <= serverPos) - countIn(removedPositionsById, pos => pos <= serverPos)
            const to = from + localChange.moveAmount
            patch.push(
              testOriginalItem(serverPos, localChange.originalValue),
              {op: 'move', from: `/${from}`, path: `/${to}`}
            )
            addedPositionsById.set(id, to)
            removedPositionsById.set(id, from)
          }
        }
      }

      //We move anyway for it to show in pendingModifications
      moves.set(id, localChange.moveAmount)
    }
  })

  const moved = originalIds
    .map((id, index) => {
      const value = original[index]
      if (moves.has(id)) {
        const move = moves.get(id)
        if (move === undefined) throw new Error('This should not happen')
        const half = move > 0 ? 0.5 : -0.5
        return {index: index+move+half, id, value}
      }
      return {index, id, value}
    })
    .sort((a, b) => a.index - b.index)
    .map(i => i.value)

  return {
    pendingModifications: moved,
    patch,
    hasModifications,
  }
}

function isMove(change: Change<unknown>): boolean {
  return (change.status === 'MOVED' || change.status === 'MOVED_AND_MODIFIED') && change.moveAmount !== 0
}

function mergeAdditions<T extends MergeableListItem>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], indexConflicts: Set<number>) : ArrayMergeResult<T> {
  const pendingModifications = [...original]

  const localAdditionsByIndex = new Map<number, T>()
  localDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to + countIn(indexConflicts, key => key <= change.to)
      pendingModifications.splice(toIndex, 0, change.originalValue)
      localAdditionsByIndex.set(toIndex, change.originalValue)
    })

  const localRemoves = new Set(
    localDiff
      .filter(change => change.status === 'REMOVED')
      .map(change => change.from)
  )

  let serverAdds = 0
  serverDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to
        + countIn(indexConflicts, key => key <= change.to)
        - countIn(localRemoves, key => key <= change.to)
        + countIn(localAdditionsByIndex, (_, key) => key <= change.to - serverAdds)

      if (localAdditionsByIndex.has(toIndex-1) &&
        areEqualWithoutId(change.originalValue, localAdditionsByIndex.get(toIndex-1))) {
        //Identical additions on both sides!
        localAdditionsByIndex.delete(toIndex-1)
        return
      }
      serverAdds++
      pendingModifications.splice(toIndex, 0, change.originalValue)
    })

  const patch : Operation[] = Array.from(localAdditionsByIndex.entries())
    .map(([, value]) =>
      ({op: 'add', path: `/${pendingModifications.indexOf(value)}`, value})
    )

  return {
    pendingModifications,
    patch,
    hasModifications: localAdditionsByIndex.size > 0,
  }
}

function countIn<T, K>(collection: Set<T> | Map<K, T>, filter: (i: T, index: K) => boolean) : number {
  let count = 0
  collection.forEach((item, index) => {
    if(filter(item, index)) count++
  })
  return count
}

function testOriginalItem(key: number, value: MergeableListItem): Operation {
  const isObject = typeof value === 'object'
  return isObject
    ? {op: 'test', path: `/${key}/_id`, value: value._id}
    : {op: 'test', path: `/${key}`, value: value}
}
