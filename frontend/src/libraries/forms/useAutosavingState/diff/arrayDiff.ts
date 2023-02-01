import { mapToIds } from '../idUtils'
import {ArrayChangeSet, Entity, ID, Operation} from '../types'

export function arrayDiff<T extends Entity>(pathBase: string, original: T[], changes: ArrayChangeSet<T>): Operation[] {
  const patch : Operation[] = []
  const ids = mapToIds(original)
  const originalIndexes = new Map(
    ids.map((id, index) => [id, index])
  )

  const testedIds = new Set<ID>()
  function testId(index, id) {
    testedIds.add(id)
  }

  changes.itemModifications.forEach((subChange, id) => {
    testId(originalIndexes.get(id), id)
    //Do stuff for changes
  })

  if (!changes.modifiedStructure) return patch

  const modifiedIndexes = new Map(
    changes.modifiedStructure.map((id, index) => [id, index])
  )

  let originalIndex = 0
  let modifiedIndex = 0
  const movedItemOriginalIndexes = new Map<ID, number>()
  for(let index = 0; index < changes.modifiedStructure.length || originalIndex < original.length; ) {
    const id = changes.modifiedStructure[index]
    const originalId = ids[originalIndex]

    if (changes.addedItems.has(id)) { //Add
      patch.push({
        op: 'add',
        path: `${pathBase}/${modifiedIndex}`,
        value: changes.addedItems.get(id)
      })
      index++
      modifiedIndex++
      continue
    }
    const originalMovedTo = modifiedIndexes.get(originalId)

    if (originalMovedTo === undefined) { //Remove
      testId(originalIndex, id)
      patch.push({
        op: 'remove',
        path: `${pathBase}/${modifiedIndex}`,
      })
      originalIndex++
      continue
    }

    if (originalId === id) {
      originalIndex++
      modifiedIndex++
      index++
      continue
    }

    const modifiedMovedFrom = originalIndexes.get(id)
    if (modifiedMovedFrom === undefined) throw new Error('Should not happen')

    //A moved item
    if (originalMovedTo > index) {
      //Note it
      movedItemOriginalIndexes.set(originalId, originalIndex)
    } else {
      
    }
  }

  return patch
}
