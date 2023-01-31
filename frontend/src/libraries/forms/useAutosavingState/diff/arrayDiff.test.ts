import {applyPatch} from 'rfc6902'

import { getId, mapToIds } from '../idUtils'
import { changedVersion, map, randomGeneratorWithSeed, toEntity} from '../testUtils'
import {arrayChange, ArrayChangeSet, Entity} from '../types'
import {arrayDiff} from './arrayDiff'

describe('arrayDiff', () => {

  it('produces empty patch with equal inputs', () => {
    const res = arrayDiff(
      '',
      [1, 2, 3, 4, 5, 6].map(toEntity),
      arrayChange(
        map()
      )
    )

    expect(res).toEqual([])
  })

  describe.skip.each([
    [0],
    /*
    [1],
    [2],
    [3],
    [4],
    /**/
  ])('random stability tests (seed = %i)', (seed) => {
    let random
    beforeEach(() => {
      random = randomGeneratorWithSeed(seed)
    })

    function testPatch(original: Entity[], version: Entity[]) {
      const changeSet = toArrayChangeSet(original, version)

      const patch = arrayDiff('', original, changeSet)

      const patched = [...original]
      const patchRes = applyPatch(patched, patch as any)
      try {
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

    }

    test('random adding', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = changedVersion(original, random, { add: random()*20 })

      testPatch(original, version)
    })
  })

})

function toArrayChangeSet(original: Entity[], version: Entity[]): ArrayChangeSet<Entity> {
  const originalIds = new Set(mapToIds(original))
  const addedVersions = version
    .map(entity => [getId(entity), entity] as const)
    .filter(([id]) => !originalIds.has(id))
  return arrayChange(
    map(),
    mapToIds(version),
    map(...addedVersions)
  )
}
