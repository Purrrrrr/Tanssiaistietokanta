import {applyPatch} from 'rfc6902'

import { mapToIds } from '../idUtils'
import merge from '../merge'
import { changedVersion, map, randomGeneratorWithSeed, toEntity} from '../testUtils'
import {arrayChange, ArrayChangeSet, Entity} from '../types'
import {arrayPatch} from './arrayPatch'
import {toJSONPatch} from './index'

describe('arrayPatch', () => {

  it('produces empty patch with equal inputs', () => {
    const res = arrayPatch(
      arrayChange<Entity>(
        map(),
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6]
      ),
      toJSONPatch,
    )

    expect(res).toEqual([])
  })

  it('produces move patch for move down', () => {
    testPatch(
      [1, 2, 3, 4].map(toEntity),
      [3, 1, 2, 4].map(toEntity)
    )
  })

  it('produces move patch for move up', () => {
    testPatch(
      [1, 2, 3, 4].map(toEntity),
      [2, 3, 1, 4].map(toEntity)
    )
  })

  it('produces move patch for swap', () => {
    testPatch(
      [1, 2, 3, 4].map(toEntity),
      [3, 2, 1, 4].map(toEntity)
    )
  })

  describe.each([
    [0],
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    /**/
  ])('random stability tests (seed = %i)', (seed) => {
    let random
    beforeEach(() => {
      random = randomGeneratorWithSeed(seed)
    })

    const toComplexEntity = (i: number) => {
      const entity = toEntity(i)
      while(random() > 0.25) {
        entity['key-'+random()] = random()
      }

      return entity
    }

    test('random adding', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { add: random()*20 })

      testPatch(original, version)
    })

    test('random removing', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { remove: random()*5 })

      testPatch(original, version)
    })

    test('random adding and removing', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { add: random()*20, remove: random()*5 })

      testPatch(original, version)
    })

    test('random moving', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { move: random()*9 })

      if (seed === 0) testPatch(original, version)
    })

    test('random adding, removing and moving', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { add: random()*20, remove: random()*5, move: random()*9 })

      testPatch(original, version)
    })

    test('random adding, removing, moving and modifying', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(toComplexEntity)
      const version = changedVersion(original, random, { add: random()*20, remove: random()*5, move: random()*9, addKeys: random()*30, removeKeys: random()*30, modifyValues: random()*30 })

      //console.log(version)

      testPatch(original, version)
    })
  })

})

function testPatch(original: Entity[], version: Entity[]) {
  const changeSet = toArrayChangeSet(original, version)

  const patch = arrayPatch(changeSet, toJSONPatch)

  const patched = [...original]
  const patchRes = applyPatch(patched, patch as any)
  //console.log(version)
  //console.log(patched)
  try {
    expect(version.map(i => i._id)).toEqual(patched.map(i => i._id))
    expect(version).toEqual(patched)
  } catch(e) {
    console.dir({
      original,
      version,
      changeSet,
      patch: patch.map((line, index) =>
        [line, patchRes[index]?.message ?? 'OK']
      ),
      patched,
    }, {depth: 5})
    throw(e)
  }
  return patch
}

function toArrayChangeSet(original: Entity[], version: Entity[]): ArrayChangeSet<Entity> {
  return merge({original, local: version, server: original}).changes ?? arrayChange(
    map(),
    mapToIds(original),
    mapToIds(version),
  )
}
