import {applyPatch} from 'rfc6902'

import {Entity, mapMergeData, MergeData, MergeResult} from './types'

import {mergeArrays} from './mergeGraph'
import merge from './mergeValues'

type DummyEntity= Entity | number
type DummyEntityList = DummyEntity[] | string

const toEntity = (item: Entity | number | string) => typeof item !== 'object' ? {_id: item, value: item} : item
function toEntityList(data: DummyEntityList): Entity[] {
  if (typeof data === 'string') return data.split('').map(toEntity)

  return data.map(toEntity)
}
function doMerge(mergeData: MergeData<DummyEntityList>): MergeResult<Entity[]> {
  return mergeArrays(
    mapMergeData(mergeData, toEntityList),
    merge,
  )
}

function mergeResult({patch, conflicts, ...res}: MergeResult<DummyEntityList>): Partial<MergeResult<Entity[]>> {
  return {
    ...res,
    pendingModifications: toEntityList(res.pendingModifications),
    /*patch: res.patch.map(line => {
      if ('value' in line && !line.path.endsWith('/value')) {
        if (line.op === 'test') {
          return {
            ...line,
            path: line.path.endsWith('/_id') ? line.path : line.path+'/_id'
          }
        }
        return {
          ...line,
          value: toEntity(line.value as DummyEntity)
        }
      }
      return line
    }),*/
  }
}

describe('mergeArrays', () => {
  test('no changes', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 2, 3, 4, 5],
      local: [1, 2, 3, 4, 5],
    })).toMatchObject(mergeResult({
      state: 'IN_SYNC',
      pendingModifications: [1, 2, 3, 4, 5],
      conflicts: [],
      patch: [],
    }))
  })

  describe('adding to lists', () => {
    test('simple additions locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 2, 3, 4, 5, 6],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
        patch: [
          {op: 'add', path: '/5', value: 6}
        ],
      }))
    })
    test('simple additions on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, 6],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
        patch: [],
      }))
    })
    test('complex additions', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [8, 7, 1, 2, 3, 4, 5],
        local: [1, 2, 3, 4, 5, 6],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [8, 7, 1, 2, 3, 4, 5, 6],
        conflicts: [],
        patch: [
          {op: 'add', path: '/7', value: 6},
        ],
      }))
    })
    test('identical additions', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, {_id: 6, data: 6}],
        local: [1, 2, 3, 4, 5, {_id: 7, data: 6}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, 5, {_id: 6, data: 6}],
        conflicts: [],
        patch: [],
      }))
    })
  })

  describe('removing from lists', () => {
    test('simple removals locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 2, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 4, 5],
        conflicts: [],
        patch: [
          {op: 'test', path: '/2', value: 3},
          {op: 'remove', path: '/2'},
        ],
      }))
    })
    test('simple removals on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 4, 5],
        conflicts: [],
        patch: [],
      }))
    })
    test('removal of modified value', () => {
      expect(doMerge({
        original: [1, 2, {_id: 3, value: 'b'}, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, {_id: 3, value: 'a'}, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'CONFLICT',
        pendingModifications: [1, 2, {_id: 3, value: 'a'}, 4, 5],
        conflicts: [
          [],
        ],
        patch: [],
      }))
    })
    test('complex removals', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [2, 4],
        conflicts: [],
        patch: [
          {op: 'test', path: '/0', value: 1},
          {op: 'remove', path: '/0'},
          {op: 'test', path: '/2', value: 5},
          {op: 'remove', path: '/2'},
        ],
      }))
    })
  })

  test('additions and removals', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [6, 1, 2, 4, 5, 8],
      local: [1, 2, 3, 4, 7],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [6, 1, 2, 4, 8, 7],
      conflicts: [],
      patch: [
        {op: 'test', path: '/4', value: 5},
        {op: 'remove', path: '/4'},
        {op: 'add', path: '/4', value: 7},
      ],
    }))
  })

  describe('moving stuff around', () => {
    test('moving locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 5, 2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
        patch: [
          {op: 'test', path: '/4', value: 5},
          {op: 'move', from: '/4', path: '/1'},
        ],
      }))
    })
    test('moving on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
        patch: [],
      }))
    })
    test('swapping next to each other locally', () => {
      expect(doMerge({
        original: [1, 2, 3],
        server: [1, 2, 3],
        local: [1, 3, 2],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 3, 2],
        conflicts: [],
        patch: [
          {op: 'test', path: '/1', value: 2},
          {op: 'move', from: '/1', path: '/2'},
        ],
      }))
    })
    test('swapping far from each other locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4],
        server: [1, 2, 3, 4],
        local: [4, 2, 3, 1],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [4, 2, 3, 1],
        conflicts: [],
        patch: [
          {op: 'test', path: '/0', value: 1},
          {op: 'move', from: '/0', path: '/2'},
          {op: 'test', path: '/3', value: 4},
          {op: 'move', from: '/3', path: '/0'},
        ],
      }))
    })
    test('swapping next to each other on server', () => {
      expect(doMerge({
        original: [1, 2, 3],
        server: [1, 3, 2],
        local: [1, 2, 3],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 3, 2],
        conflicts: [],
        patch: [],
      }))
    })
    test('swapping far from each other on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4],
        server: [4, 2, 3, 1],
        local: [1, 2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [4, 2, 3, 1],
        conflicts: [],
        patch: [],
      }))
    })

    test('identical moving on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 5, 2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
        patch: [],
      }))
    })

    test('different moves on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 4, 3, 5],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 5, 2, 4, 3],
        conflicts: [],
        patch: [
          {op: 'test', path: '/3', value: 3},
          {op: 'move', from: '/3', path: '/4'},
        ],
      }))
    })
  })

  describe('modifying items', () => {
    test('modifying locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 5}],
        local: [1, 2, 3, 4, {_id: 5, value: 8}],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
        patch: [
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'replace', path: '/4/value', value: 8},
        ],
      }))
    })
    test('modifying on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 8}],
        local: [1, 2, 3, 4, {_id: 5, value: 5}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
        patch: [],
      }))
    })
    test('modifying on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 8}],
        local: [1, 2, 3, 4, {_id: 5, value: 8}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
        patch: [],
      }))
    })

    test('modifying and moving on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, {_id: 5, value: 8}, 3, 4],
        local: [1, 2, 3, 4, {_id: 5, value: 5}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
        patch: [],
      }))
    })

    test('modifying and moving locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 5}],
        local: [1, 2, {_id: 5, value: 8}, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
        patch: [
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'replace', path: '/4/value', value: 8},
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'move', path: '/2', from: '/4'},
        ],
      }))
    })

    test('modifying and moving on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, {_id: 5, value: 5}, 3, 4],
        local: [1, 2, {_id: 5, value: 8}, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
        patch: [
          {op: 'test', path: '/2/_id', value: 5},
          {op: 'replace', path: '/2/value', value: 8},
        ],
      }))
    })
  })

  test('tough cases #1', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 4, 5, 6],
      local: [1, {_id: 2}, {_id: 3}, 4],
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      pendingModifications: [1, {_id: 2}, {_id: 3}, 4, 6],
      conflicts: [
        [],
      ],
      patch: [
        {op: 'test', path: '/2', value: 5},
        {op: 'remove', path: '/2'},
      ]
    }))
  })

  test('tough cases 3', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [6, 1, 4, 2, 3, 55, 66],
      local: [5, 1, 2, 3],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [6, 5, 1, 2, 3, 55, 66],
      conflicts: [],
      patch: [
        {op: 'add', path: '/0', value: 5},
      ]
    }))
  })

  test('tough cases 4', () => {
    expect(doMerge({
      original: [1, 2, 3],
      server: [6, 1, 3, 2, 55, 66],
      local: [5, 1, 3],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [6, 5, 1, 3, 55, 66],
      conflicts: [
        [],
      ],
      patch: [
        {op: 'add', path: '/0', value: 5},
      ]
    }))
  })

  test('tough cases 5', () => {
    expect(doMerge({
      original: [4, 5, 11, 22, 33],
      server: [4, 5, 6, 7, 8, 9, 11, 22, 33],
      local: [4, 10, 11, 22, 33],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [4, 6, 7, 8, 9, 10, 11, 22, 33],
      conflicts: [],
      patch: [
        {op: 'test', path: '/1', value: 5},
        {op: 'remove', path: '/1'},
        {op: 'add', path: '/1', value: 10},
      ],
    }))
  })

  test('tough cases 6', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, 9, 2, 8, 3, 7, 4, 6],
      local: [1, 11, 2, 3, 4],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [1, 9, 11, 2, 8, 3, 7, 4, 6],
      conflicts: [],
      patch: [
        {op: 'add', path: '/1', value: 11},
      ],
    }))
  })
  test('tough cases 6B', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, 9,  2, 8, 3, 7, 4, 6],
      local:  [1, 11, 2, 3, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [1, 9, 11, 2, 8, 3, 7, 4, 6, 10],
      conflicts: [],
      patch: [
        {op: 'add', path: '/1', value: 11}, {op: 'add', path: '/9', value: 10},
      ],
    }))
  })
  test('tough cases 6Bb', () => {
    expect(doMerge({
      original: [3, 4],
      server: [8, 3, 7, 4, 6],
      local:  [3, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [8, 3, 7, 4, 6, 10],
      conflicts: [],
      patch: [
        {op: 'add', path: '/4', value: 10},
      ],
    }))
  })
  test('tough cases 6C', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, {_id: 9, value: 9}, 2, 8, 3, 7, 4, 6],
      local: [1, 11, 2, 3, 12, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [1, 9, 11, 2, 8, 3, 7, 12, 4, 6, 10],
      conflicts: [],
      patch: [
        {op: 'add', path: '/1', value: 11},
        {op: 'add', path: '/7', value: 12},
        {op: 'add', path: '/10', value: 10},
      ],
    }))
  })

  test('tough cases 7', () => {
    expect(doMerge({
      original: 'TKQNFBP',
      server: 'KQTNJPFS',
      local: 'TKMNJPFX',
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      pendingModifications: 'K??NJPFSX',
      conflicts: [],
      patch: [

      ],
    }))
  })

  test('tough cases 8', () => {
    expect(doMerge({
      original: 'ABC',
      server: 'BAC',
      local: 'ACB',
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      pendingModifications: 'ACB',
      conflicts: [],
      patch: [

      ],
    }))
  })

  test('tough cases 8B', () => {
    expect(doMerge({
      original: 'ABCxabc',
      server: 'acbxBAC',
      local: 'ACBxbac',
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      pendingModifications: 'acbxBAC',
      conflicts: [],
      patch: [

      ],
    }))
  })

  test('tough cases 9', () => {
    expect(doMerge({
      original: 'ABCDEF',
      server: 'ACDEFB',
      local: 'ABDECF',
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: 'ADECFB',
      conflicts: [],
      patch: [

      ],
    }))
  })

  test('tough cases 9B', () => {
    expect(doMerge({
      original: 'ABCDEF',
      server: 'ACXDEFB',
      local: 'AYBDECF',
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: 'AYDECXFB',
      conflicts: [],
      patch: [

      ],
    }))
  })

  describe.skip.each([
    [0],
    [1],
    [2],
    [3],
    [4],
  ])('random tests patch (seed = %i)', (seed) => {
    function mulberry32(a: number) {
      return function() {
        let t = a += 0x6D2B79F5
        /* eslint-disable */
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
        /* eslint-enable */
      }
    }

    let random
    beforeEach(() => {
      random = mulberry32(seed)
    })


    let i = 10
    const randomIndex = (arr: unknown[]) => Math.floor(random()*arr.length)
    const addRandom = (arr: unknown[]) => arr.splice(randomIndex(arr), 0, toEntity(++i))
    const removeRandom = (arr: unknown[]) => arr.splice(randomIndex(arr), 1)
    const moveRandom = (arr: unknown[]) => {
      const from = randomIndex(arr)
      const [val] = arr.splice(from, 1)
      arr.splice(randomIndex(arr), 0, val)
    }
    const repeatIn = (arr: unknown[], num: number, action: (arr: unknown[]) => unknown) => {
      for(let i = 0; i < num; i++) action(arr)
    }

    function testPatching(original: Entity[], modified: Entity[]) {
      const {pendingModifications, patch }= mergeArrays({original, server: original, local: modified}, merge)

      const patched = [...original]
      const patchRes = applyPatch(patched, patch as any)
      try {
        expect(pendingModifications).toEqual(patched)
      } catch(e) {
        console.dir({
          original,
          modified,
          pendingModifications,
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
      const added = [...original]
      repeatIn(added, random()*20, addRandom)

      testPatching(original, added)
    })

    test('random removals', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const added = [...original]
      repeatIn(added, random()*5, removeRandom)

      testPatching(original, added)
    })

    test('random moving', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const added = [...original]
      repeatIn(added, random()*5, moveRandom)

      testPatching(original, added)
    })

    test('random everything', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const added = [...original]
      repeatIn(added, random()*20, addRandom)
      repeatIn(added, random()*5, removeRandom)
      repeatIn(added, random()*5, moveRandom)

      testPatching(original, added)
    })
  })
})
