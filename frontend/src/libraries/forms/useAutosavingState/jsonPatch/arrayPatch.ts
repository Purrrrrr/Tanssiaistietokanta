import { ID, Operation, PatchGenerator } from './types'

import {mapToIds} from '../idUtils'
import {Entity} from '../types'

export function arrayPatch<T extends Entity>(original: T[], changed: T[], toJSONPatch: PatchGenerator, pathBase = ''): Operation[] {
  const patch : Operation[] = []
  const originalIds = mapToIds(original)
  const modifiedIds = mapToIds(changed)
  const originalIndexesById = new Map(
    originalIds.map((id, index) => [id, index])
  )
  const modifiedIndexesById = new Map(
    modifiedIds.map((id, index) => [id, index])
  )
  const commonIds = new Set([...originalIds, ...modifiedIds])

  function testId(index, id) {
    patch.push({
      op: 'test',
      path: `${pathBase}/${index}/_id`,
      value: id,
    })
  }

  commonIds.forEach(id => {
    const originalIndex = originalIndexesById.get(id)
    const modifiedIndex = modifiedIndexesById.get(id)
    if (originalIndex === undefined || modifiedIndex === undefined) return

    const subPatch = toJSONPatch(original[originalIndex], changed[modifiedIndex], `${pathBase}/${originalIndex}`)
    if (subPatch.length > 0) {
      testId(originalIndex, id)
      patch.push(...subPatch)
    }
  })

  let indexInModified = 0
  let indexInOriginal = 0
  let addRemove = 0

  const movedIntoPlaceFrom = new Map<ID, number>()

  let i = 0
  while(indexInModified < modifiedIds.length || indexInOriginal < originalIds.length) {
    i++
    if (i > 99) return patch //throw new Error('baaa')
    const id = modifiedIds[indexInModified]
    const originalId = originalIds[indexInOriginal]

    if (id && !originalIndexesById.has(id)) { //Add
      patch.push({
        op: 'add',
        path: `${pathBase}/${indexInModified}`,
        value: changed[indexInModified],
      })
      indexInModified++
      addRemove++
      continue
    }

    const originalMovedTo = modifiedIndexesById.get(originalId)

    if (originalMovedTo === undefined) { //Remove
      testId(indexInModified, originalId)
      patch.push({
        op: 'remove',
        path: `${pathBase}/${indexInModified}`,
      })
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
      movedIntoPlaceFrom.delete(id)
      indexInOriginal++
      continue
    }

    const modifiedMovedFrom = originalIndexesById.get(id)
    if (modifiedMovedFrom === undefined) throw new Error('Should not happen')

    const movedIntoBefore = count(movedIntoPlaceFrom.values(), i => i > modifiedMovedFrom)
    const from = modifiedMovedFrom
      + movedIntoBefore
      + addRemove

    //A moved item
    testId(from, id)
    patch.push({
      op: 'move',
      from: `${pathBase}/${from}`,
      path: `${pathBase}/${indexInModified}`,
    })
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
