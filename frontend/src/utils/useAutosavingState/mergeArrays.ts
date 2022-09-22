import {getArrayChanges, Change} from './arrayDiff'
import { mapToIds, areEqualWithoutId } from './idUtils'
import {MergeData, MergeResult, MergeFunction, SyncState, Path} from './types'
import {emptyPath, subIndexPath} from './pathUtil'

type ArrayMergeResult<T> = {
  hasModifications: boolean
  pendingModifications: T[]
}

export function mergeArrays<T>(
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

  const conflicts : Path<T[]>[] = indexConflicts.size > 0
    ? [emptyPath<T[]>()]
    : modifyResult.conflicts

  return {
    state,
    pendingModifications: addResult.pendingModifications,
    conflicts,
  }
}

function mergeModifications <T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], merge : MergeFunction) : MergeResult<T[]> {
  const modifiedIndexesById = new Map<any,number>()
  const pendingModifications = [...original]
  const conflicts : Path<T[]>[] = []

  localDiff
    .filter(change => ['MODIFIED', 'MOVED_AND_MODIFIED'].includes(change.status))
    .forEach(change => {
      pendingModifications[change.from] = change.changedValue!
      modifiedIndexesById.set(change.id, change.from)
    })
  serverDiff
    .filter(change => ['MODIFIED', 'MOVED_AND_MODIFIED'].includes(change.status))
    .forEach(change => {
      const server = change.changedValue!
      if (modifiedIndexesById.has(change.id)) {
        const originalItem = original[change.from]
        const local = pendingModifications[change.from]
        const result = merge({ original: originalItem, local, server })

        switch(result.state) {
          case 'IN_SYNC':
            modifiedIndexesById.delete(change.id)
            break
          case 'MODIFIED_LOCALLY':
            pendingModifications[change.from] = result.pendingModifications
            break
          case 'CONFLICT':
            const subConflicts : Path<T[]>[] = result.conflicts
              .map(conflict => subIndexPath(change.from, conflict))
            conflicts.push(...subConflicts)
        }
      } else {
        pendingModifications[change.from] = change.changedValue!
      }
    })

  let state : SyncState = modifiedIndexesById.size > 0 ? 'MODIFIED_LOCALLY' : 'IN_SYNC'
  if (conflicts.length > 0) state = 'CONFLICT'

  return {
    state,
    pendingModifications: pendingModifications,
    conflicts,
  }
}

function mergeDeletes<T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : ArrayMergeResult<T> {
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
  let hasModifications = false
  original.forEach((value, index) => {
    const serverStatus = serverChanges.get(index)!.status
    const localStatus = localChanges.get(index)!.status
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
    }
  })

  return {
    pendingModifications: original.filter((_, index) => !deletedKeys.has(index)),
    hasModifications,
  }
}

function mergeMoves<T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : ArrayMergeResult<T> {
  if (conflicts.size > 0) {
    return {
      pendingModifications: original,
      hasModifications: false,
    }
  }

  const originalIds = mapToIds(original)
  const serverChangesById = new Map(
    serverDiff.map(change => [change.id, change])
  )
  const localChangesById = new Map(
    localDiff.map(change => [change.id, change])
  )

  const moves = new Map<any,number>()
  let hasModifications = false
  originalIds.forEach((id, index) => {
    const localChange = localChangesById.get(id)!
    if (localChange.status === 'ADDED') return
    const serverChange = serverChangesById.get(id)!

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
      }

      //We move anyway for it to show in pendingModifications
      moves.set(id, localChange.moveAmount)
    }
  })

  const moved = originalIds
    .map((id, index) => {
      const value = original[index]
      if (moves.has(id)) {
        const move = moves.get(id)!
        const half = move > 0 ? 0.5 : -0.5
        return {index: index+move+half, id, value}
      }
      return {index, id, value}
    })
    .sort((a,b) => a.index - b.index)
    .map(i => i.value)

  return {
    pendingModifications: moved,
    hasModifications,
  }
}

function isMove(change: Change<any>): boolean {
  return (change.status === 'MOVED' || change.status === 'MOVED_AND_MODIFIED') && change.moveAmount !== 0
}

function mergeAdditions<T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], indexConflicts: Set<number>) : ArrayMergeResult<T> {
  const pendingModifications = [...original]

  const localAdditionsByIndex = new Map<number, any>()
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

  serverDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to
        + countIn(indexConflicts, key => key <= change.to)
        - countIn(localRemoves, key => key <= change.to)
        + countIn(localAdditionsByIndex, (_,key) => key <= change.to)

      if (localAdditionsByIndex.has(toIndex-1) &&
        areEqualWithoutId(change.originalValue, localAdditionsByIndex.get(toIndex-1))) {
        //Identical additions on both sides!
        localAdditionsByIndex.delete(toIndex-1)
        return
      }
      pendingModifications.splice(toIndex, 0, change.originalValue)
    })

  return {
    pendingModifications,
    hasModifications: localAdditionsByIndex.size > 0,
  }
}

function countIn<T,K>(collection: Set<T> | Map<K,T>, filter: (i: T, index: K) => boolean) : number {
  let count = 0
  collection.forEach((item, index) => {
    if(filter(item, index)) count++
  })
  return count
}
