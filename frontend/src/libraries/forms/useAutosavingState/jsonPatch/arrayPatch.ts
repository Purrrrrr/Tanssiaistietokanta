import {applyPatch} from 'rfc6902'

import {ArrayChangeSet, ID } from '../types'
import {Operation} from './jsonPatch'

const log = (...args: unknown[]) => { /* empty */ }

export function arrayPatch<T>(changes: ArrayChangeSet<T>, pathBase = ''): Operation[] {
  const patch : Operation[] = []
  const originalIds = changes.originalStructure
  const modifiedIds = changes.modifiedStructure
  const originalIndexes = new Map(
    originalIds.map((id, index) => [id, index])
  )

  function testId(index, id) {
    patch.push({
      op: 'test',
      path: `${pathBase}/${index}/_id`,
      value: id,
    })
  }

  changes.itemModifications.forEach((subChange, id) => {
    testId(originalIndexes.get(id), id)
    //Do stuff for changes
  })

  if (!modifiedIds) return patch

  const modifiedIndexes = new Map(
    modifiedIds.map((id, index) => [id, index])
  )

  let indexInModified = 0
  let indexInOriginal = 0
  let addRemove = 0

  const movedIntoPlaceFrom = new Map<ID, number>()

  const patched = [...originalIds]
  const logging = false

  while(indexInModified < modifiedIds.length || indexInOriginal < originalIds.length) {
    const id = modifiedIds[indexInModified]
    const originalId = originalIds[indexInOriginal]

    if (logging) {
      const a = originalIds.slice(0, indexInOriginal).join(', ') + ' | '
      const b = modifiedIds.slice(0, indexInModified).join(', ') + ' | '
      log('Original to process ' +a + originalIds.slice(indexInOriginal).map(id => movedIntoPlaceFrom.has(id) ? '!'+id : id).join(', ')
        +'\nModified to process ' +b + modifiedIds.slice(indexInModified).join(', ')
        + '\nPatched ' + patched.map(i => (i as any)._id ?? i).join(', '))
    }

    if (changes.addedItems.has(id)) { //Add
      patch.push({
        op: 'add',
        path: `${pathBase}/${indexInModified}`,
        value: changes.addedItems.get(id)
      })
      if (logging) applyPatch(patched, [patch.at(-1)] as any)
      indexInModified++
      addRemove++
      continue
    }
    const originalMovedTo = modifiedIndexes.get(originalId)

    if (originalMovedTo === undefined) { //Remove
      testId(indexInOriginal, id)
      patch.push({
        op: 'remove',
        path: `${pathBase}/${indexInModified}`,
      })
      if (logging) applyPatch(patched, [patch.at(-1)] as any)
      indexInOriginal++
      addRemove--
      continue
    }

    if (originalId === id) {
      indexInOriginal++
      indexInModified++
      continue
    }

    if (movedIntoPlaceFrom.has(originalId)) {
      log('has '+originalId)
      movedIntoPlaceFrom.delete(id)
      indexInOriginal++
      continue
    }

    const modifiedMovedFrom = originalIndexes.get(id)
    if (modifiedMovedFrom === undefined) throw new Error('Should not happen')

    const movedIntoBefore = count(movedIntoPlaceFrom.values(), i => i > modifiedMovedFrom)
    const from = modifiedMovedFrom
      + movedIntoBefore
      + addRemove

    log({id, addRemove, modifiedMovedFrom, count: movedIntoBefore}, movedIntoPlaceFrom)

    //A moved item
    testId(from, id)
    patch.push({
      op: 'move',
      from: `${pathBase}/${from}`,
      path: `${pathBase}/${indexInModified}`,
    })
    if (logging) applyPatch(patched, [patch.at(-1)] as any)
    log([patch.at(-1)])
    movedIntoPlaceFrom.set(id, modifiedMovedFrom)
    indexInModified++
  }

  return patch
}

function count<T>(i: Iterable<T>, pred: (i: T) => boolean): number {
  let result = 0
  for(const item of i) {
    if (pred(item)) result++
  }
  return result
}
