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

  let index = 0
  let originalIndex = 0
  let modifiedIndex = 0
  let i = 0
  const movedIntoPlace = new Set<ID>()
  const movedItemOriginalIndexes = new Map<ID, number>()
  while(index < changes.modifiedStructure.length || originalIndex < original.length) {
    i++
    if (i > 80) throw new Error('!')
    const id = changes.modifiedStructure[index]
    const originalId = ids[originalIndex]

    console.log('Original to process ' + ids.slice(originalIndex).filter(id => !movedIntoPlace.has(id)).join(', '))
    console.log('Modified to process ' + changes.modifiedStructure.slice(index).join(', '))

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

    if (movedIntoPlace.has(originalId)) {
      console.log('has '+originalId)
      movedIntoPlace.delete(originalId)
      originalIndex++
      continue
    }

    const modifiedMovedFrom = originalIndexes.get(id)
    if (modifiedMovedFrom === undefined) throw new Error('Should not happen')

    //A moved item
    const originalMoveAmount = originalMovedTo-originalIndex
    const newMoveAmount = originalIndex-modifiedMovedFrom

    console.log({originalIndex, originalId, originalMoveAmount, index, id, newMoveAmount})

    if (newMoveAmount < 0 ) {
      patch.push({
        op: 'move',
        from: `${pathBase}/${modifiedMovedFrom+movedIntoPlace.size}`,
        path: `${pathBase}/${index}`,
      })
      movedIntoPlace.add(id)
      modifiedIndex++
      index++
      continue
    }
    /*
    if (originalMoveAmount > 0) { //Original has moved further away into the list
      //Note it
      movedItemOriginalIndexes.set(originalId, modifiedIndex)

      if (newMoveAmount < -1) {
        movedIntoPlace.add(id)
        patch.push({
          op: 'move',
          from: `${pathBase}/${modifiedIndex}`,
          path: `${pathBase}/${index}`,
        })
        originalIndex++
        index++
        continue
      } else {
        originalIndex++
        index++
        continue
      }
    } else {
      
    } */

    originalIndex++
    modifiedIndex++
    index++
  }

  return patch
}
