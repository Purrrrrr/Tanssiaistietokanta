import deepEquals from 'fast-deep-equal'

export type ChangeType = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'MOVED' | 'MOVED_AND_MODIFIED' | 'UNCHANGED'
export interface Change<T> extends PartialChange {
  originalValue: T
  changedValue?: T
}
interface Move extends PartialChange {
  status: 'MOVED'
}
interface PartialChange {
  id: any,
  status: ChangeType,
  moveAmount: number, //Amount of spaces the item has moved without taking into account additions and removals
  from: number,
  to: number,
}

export function getArrayChanges<T>(original: T[], changed: T[]): Change<T>[] {
  const originalIds = mapToIds(original)
  const changedIds = mapToIds(changed)

  const originalIndexesById = new Map(
    originalIds.map((id, index) => [id, index])
  )
  const changedIndexesById = new Map(
    changedIds.map((id, index) => [id, index])
  )
  const statuses = new Map<any,PartialChange>(
    originalIds.map((id, index) => [id, {status: 'UNCHANGED', id, from: index, to: index, moveAmount: 0}])
  )

  const originalIdsWithoutRemoved = originalIds.filter((id, index) => {
    const exists = changedIndexesById.has(id)
    if (!exists) {
      statuses.set(id, {
        id,
        status: 'REMOVED',
        from: index,
        to: -Infinity,
        moveAmount: -Infinity,
      })
    }
    return exists
  })
  const changedIdsWithoutAdded = changedIds.filter((id, index) => {
    const exists = originalIndexesById.has(id)
    if (!exists) {
      statuses.set(id, {
        id,
        status: 'ADDED',
        from: Infinity,
        to: index,
        moveAmount: Infinity,
      })
    }
    return exists
  })

  for (let index = 0; index < originalIdsWithoutRemoved.length; index++) {
    const id = originalIdsWithoutRemoved[index]
    const changedId = changedIdsWithoutAdded[index]
    if (id === changedId) {
      statuses.get(id)!.to = changedIndexesById.get(id)!
      continue
    }

    statuses.set(id, {
      id,
      status: 'MOVED',
      from: originalIndexesById.get(id)!,
      to: changedIndexesById.get(id)!,
      moveAmount: changedIdsWithoutAdded.indexOf(id) - index,
    })
  }

  const changes : Change<T>[]= Array.from(statuses.values())
    .map(change => ({...change, originalValue: change.status !== 'ADDED' ? original[change.from] : changed[change.to]}))
    .sort((a,b) => (a.to) - (b.to))

  minimizeMoveSet(changes)

  //Detect and mark modifications in content
  changes
    .filter(change => change.status === 'MOVED' || change.status === 'UNCHANGED')
    .filter(change => !deepEquals(change.originalValue, changed[change.to]))
    .forEach(change => { 
      change.status = change.status === 'UNCHANGED' ? 'MODIFIED' : 'MOVED_AND_MODIFIED'
      change.changedValue = changed[change.to]
    })

  return changes
}

export function mapToIds(items: any[]): any[] {
  const ids = new Set()
  return items.map(item => {
    let id = getPossibleId(item)
    if (ids.has(id)) {
      id = { id }
    }
    ids.add(id)
    return id
  })
}

function getPossibleId(item: any): any {
  if (typeof item !== 'object') return item
  if ('_id' in item) {
    return item._id
  }
  if ('id' in item) {
    return item.id
  }
  return item
}

function minimizeMoveSet<T>(changes: Change<T>[]) {
  const moves : Move[] = changes.filter(({status}) => status === 'MOVED') as Move[]
  const compensated = new Set()
  const greatestMoves = moves
    .filter(state => !compensated.has(state.id) && state.moveAmount !== 0)
    .map((state, index) => ({index, ...state}))
    .sort((a,b) => Math.abs(b.moveAmount) - Math.abs(a.moveAmount))
  for(const move of greatestMoves) {
    //console.log(move)
    const {moveAmount, id, from, to} = move
    if (moveAmount === -1 || moveAmount === 1) break;

    const affected = changes
      .filter(movedItem => !compensated.has(movedItem.id))
      .filter(movedItem => Number.isFinite(movedItem.moveAmount))
      .filter(movedItem => (moveAmount > 0)
        ? (movedItem.from > from && movedItem.to < to)
        : (movedItem.from < from && movedItem.to > to)
    ).slice(0, Math.abs(moveAmount))
    //console.log(affected.map(a => a.id))
    
    const sign = moveAmount > 0 ? 1 : -1
    affected.forEach(move => move.moveAmount! += sign)
    compensated.add(id)
  }
}

// @ts-ignore
window.getArrayChanges = getArrayChanges
