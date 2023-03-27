import {ArrayChangeSet, ID, Operation, PatchGenerator, Preference} from './types'

export function arrayPatch<T>(changes: ArrayChangeSet<T>, toJSONPatch: PatchGenerator, preferVersion: Preference, pathBase = ''): Operation[] {
  const patch : Operation[] = []
  const originalIds = changes.originalStructure
  const modifiedIds = ('conflictingLocalStructure' in changes && preferVersion === 'LOCAL')
    ? changes.conflictingLocalStructure
    : changes.modifiedStructure
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
    const index = originalIndexes.get(id)
    if (index === undefined) throw new Error('should not happen')
    testId(index, id)
    patch.push(
      ...toJSONPatch(subChange, preferVersion, `${pathBase}/${index}`)
    )
  })

  if (!modifiedIds) return patch

  const modifiedIndexes = new Map(
    modifiedIds.map((id, index) => [id, index])
  )

  let indexInModified = 0
  let indexInOriginal = 0
  let addRemove = 0

  const movedIntoPlaceFrom = new Map<ID, number>()

  while(indexInModified < modifiedIds.length || indexInOriginal < originalIds.length) {
    const id = modifiedIds[indexInModified]
    const originalId = originalIds[indexInOriginal]

    if (changes.addedItems.has(id)) { //Add
      patch.push({
        op: 'add',
        path: `${pathBase}/${indexInModified}`,
        value: changes.addedItems.get(id)
      })
      indexInModified++
      addRemove++
      continue
    }
    const originalMovedTo = modifiedIndexes.get(originalId)

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

    const modifiedMovedFrom = originalIndexes.get(id)
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
