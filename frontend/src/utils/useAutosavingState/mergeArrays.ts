import {getArrayChanges, mapToIds, Change} from './arrayDiff'
import {MergeData, MergeResult} from './mergeValues'

export function mergeArrays<T>(
  data: MergeData<T[]>
) : MergeResult<T[]> {
  const serverDiff = getArrayChanges(data.original, data.server)
  const localDiff = getArrayChanges(data.original, data.local)

  let { conflicts, pendingModifications } = mergeDeletes(data.original, serverDiff, localDiff);
  ({ conflicts, pendingModifications } = mergeMoves(pendingModifications, serverDiff, localDiff, conflicts))

  const additionIndexes = new Set<number>()
  localDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to + countInSet(conflicts, key => key <= change.to)
      pendingModifications.splice(toIndex, 0, change.originalValue)
      additionIndexes.add(toIndex)
    })

  //TODO: handle two similar adds as one
  serverDiff
    .filter(change => change.status === 'ADDED')
    .forEach(change => {
      const toIndex = change.to
        + countInSet(conflicts, key => key <= change.to)
        + countInSet(additionIndexes, key => key <= change.to)
      pendingModifications.splice(toIndex, 0, change.originalValue)
    })

  return {
    state: conflicts.size > 0 ? 'CONFLICT' : 'IN_SYNC', //TODO: THIS IS SPART... WRONG
    pendingModifications: pendingModifications,
    conflicts: Array.from(conflicts).map(key => data.key+"/"+key),
  }
}
// @ts-ignore
window.mergeArrays = mergeArrays

function mergeDeletes<T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[]) : { pendingModifications: T[], conflicts: Set<number> } {
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
  const conflictedKeys = new Set<number>()
  original.forEach((value, index) => {
    const serverStatus = serverChanges.get(index)!.status
    const localStatus = localChanges.get(index)!.status
    const removedOnServer = serverStatus === 'REMOVED'
    const removedOnLocal = localStatus === 'REMOVED'

    if (!removedOnServer && !removedOnLocal) return
    if (removedOnServer) {
      if (removedOnLocal || localStatus === 'UNCHANGED') {
        deletedKeys.add(index)
        return
      }
    }
    //Removed on local
    if(serverStatus === 'UNCHANGED') {
      deletedKeys.add(index)
      return
    }

    conflictedKeys.add(index)
  })

  return {
    pendingModifications: original.filter((_, index) => !deletedKeys.has(index)),
    conflicts: conflictedKeys,
  }
}

function mergeMoves<T>(original: T[], serverDiff: Change<T>[], localDiff: Change<T>[], conflicts: Set<number>) : { pendingModifications: T[], conflicts: Set<number> } {
  if (conflicts.size > 0) {
    return {
      pendingModifications: original,
      conflicts,
    }
  }

  const originalIds = mapToIds(original)
  const serverChangesById = new Map(
    serverDiff.map(change => [change.id, change])
  )
  const localChangesById = new Map(
    localDiff.map(change => [change.id, change])
  )

  const conflictedKeys = new Set<number>()
  const moves = new Map<any,number>()
  originalIds.forEach((id, index) => {
    const serverChange = serverChangesById.get(id)
    const localChange = localChangesById.get(id)!

    if (serverChange !== undefined && isMove(serverChange)) {
      if(localChange.moveAmount === 0) {
        moves.set(id, serverChange.moveAmount)
      } else {
        conflictedKeys.add(index)
      }
    }
    if (isMove(localChange)) {
      if(serverChange === undefined || serverChange.moveAmount === 0) {
        moves.set(id, localChange.moveAmount)
      } else {
        conflictedKeys.add(index)
      }
    }
  })

  console.log(moves)
  
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
  console.log(moved)
  console.log(conflictedKeys)

  return {
    pendingModifications: moved,
    conflicts: conflictedKeys,
  }
}

function isMove(change: Change<any>): boolean {
  return (change.status === 'MOVED' || change.status === 'MOVED_AND_MODIFIED') && change.moveAmount !== 0
}

function countInSet<T>(set: Set<T>, filter: (i: T) => boolean) : number {
  let count = 0
  set.forEach(item => {
    if(filter(item)) count++
  })
  return count
}
