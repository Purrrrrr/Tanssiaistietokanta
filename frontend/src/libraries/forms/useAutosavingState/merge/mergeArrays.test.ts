import {arrayConflict, Deleted, Entity, mapMergeData, MergeData, PartialMergeResult, removedArrayItemConflict, scalarConflict} from '../types'

import {changedVersion, randomGeneratorWithSeed, toEntity} from '../testUtils'
import merge from './index'
import {mergeArrays} from './mergeArrays'

type DummyEntity = Entity | number
type DummyEntityList = DummyEntity[] | string

function toEntityList(data: DummyEntityList): Entity[] {
  if (typeof data === 'string') return data.split('').map(toEntity)

  return data.map(toEntity)
}
function doMerge(mergeData: MergeData<DummyEntityList>): PartialMergeResult<Entity[]> {
  return mergeArrays(
    mapMergeData(mergeData, toEntityList),
    merge,
  )
}

function mergeResult(res: Omit<PartialMergeResult<DummyEntityList>, 'changes'>): Partial<PartialMergeResult<Entity[]>> {
  return {
    ...res,
    modifications: toEntityList(res.modifications),
    nonConflictingModifications: toEntityList(res.nonConflictingModifications),
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
      modifications: [1, 2, 3, 4, 5],
      nonConflictingModifications: [1, 2, 3, 4, 5],
      conflicts: [],
    }))
  })

  test('conflicts in item', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 2, {_id: 3, value: 5}, 4, 5],
      local: [1, 2, {_id: 3, value: 1}, 4, 5],
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      modifications: [1, 2, {_id: 3, value: 1}, 4, 5],
      nonConflictingModifications: [1, 2, {_id: 3, value: 5}, 4, 5],
      conflicts: [
        scalarConflict(
          {local: 1, server: 5, original: 3},
          ['value', 2],
        ),
        scalarConflict(
          {local: {_id: 3, value: 1}, server: {_id: 3, value: 5}, original: {_id: 3, value: 3}},
          [2],
        ),
      ],
    }))
  })

  test('conflicts in moved item', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 2, 4, {_id: 3, value: 5}, 5],
      local: [1, 2, {_id: 3, value: 1}, 4, 5],
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      modifications: [1, 2, 4, {_id: 3, value: 1}, 5],
      nonConflictingModifications: [1, 2, 4, {_id: 3, value: 5}, 5],
      conflicts: [
        scalarConflict(
          {local: 1, server: 5, original: 3},
          ['value', 3]
        ),
        scalarConflict(
          {local: {_id: 3, value: 1}, server: {_id: 3, value: 5}, original: {_id: 3, value: 3}},
          [3]
        ),
      ],
    }))
  })

  test('conflicts in moved item #2', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 2, 4, {_id: 3, value: 5}, 5],
      local: [1, {_id: 3, value: 1}, 2, 4, 5],
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      modifications: [1, {_id: 3, value: 1}, 2, 4, 5],
      nonConflictingModifications: [1, 2, 4, {_id: 3, value: 5}, 5],
      conflicts: [
        scalarConflict(
          {local: 1, server: 5, original: 3},
          {server: ['value', 3], local: ['value', 1]}
        ),
        scalarConflict(
          {local: {_id: 3, value: 1}, server: {_id: 3, value: 5}, original: {_id: 3, value: 3}},
          {server: [3], local: [1]}
        ),
        arrayConflict({
          original: toEntityList([1, 2, 3, 4, 5]),
          server: toEntityList([1, 2, 4, {_id: 3, value: 5}, 5]),
          local: toEntityList([1, {_id: 3, value: 1}, 2, 4, 5]),
        })
      ],
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
        modifications: [1, 2, 3, 4, 5, 6],
        nonConflictingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
      }))
    })
    test('simple additions on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, 6],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, 3, 4, 5, 6],
        nonConflictingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
      }))
    })
    test('complex additions', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [8, 7, 1, 2, 3, 4, 5],
        local: [1, 2, 3, 4, 5, 6],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [8, 7, 1, 2, 3, 4, 5, 6],
        nonConflictingModifications: [8, 7, 1, 2, 3, 4, 5, 6],
        conflicts: [],
      }))
    })
    test('identical additions on end', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, {_id: 6, data: 6}],
        local: [1, 2, 3, 4, 5, {_id: 7, data: 6}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, 3, 4, 5, {_id: 6, data: 6}],
        nonConflictingModifications: [1, 2, 3, 4, 5, {_id: 6, data: 6}],
        conflicts: [],
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
        modifications: [1, 2, 4, 5],
        nonConflictingModifications: [1, 2, 4, 5],
        conflicts: [],
      }))
    })
    test('simple removals on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, 4, 5],
        nonConflictingModifications: [1, 2, 4, 5],
        conflicts: [],
      }))
    })
    test('removal of modified value (modified locally)', () => {
      expect(doMerge({
        original: [1, 2, {_id: 3, value: 'b'}, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, {_id: 3, value: 'a'}, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'CONFLICT',
        modifications: [1, 2, {_id: 3, value: 'a'}, 4, 5],
        nonConflictingModifications: [1, 2, 4, 5],
        conflicts: [
          removedArrayItemConflict(
            {original: {_id: 3, value: 'b'}, local: {_id: 3, value: 'a'}, server: Deleted},
            2,
          ),
          arrayConflict({
            original: toEntityList([1, 2, {_id: 3, value: 'b'}, 4, 5]),
            server: toEntityList([1, 2, 4, 5]),
            local: toEntityList([1, 2, {_id: 3, value: 'a'}, 4, 5]),
          })
        ],
      }))
    })
    test('removal of modified value (modified on server)', () => {
      expect(doMerge({
        original: [1, 2, {_id: 3, value: 'b'}, 4, 5],
        server: [1, 2, {_id: 3, value: 'a'}, 4, 5],
        local: [1, 2, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'CONFLICT',
        modifications: [1, 2, 4, 5],
        nonConflictingModifications: [1, 2, {_id: 3, value: 'a'}, 4, 5],
        conflicts: [
          removedArrayItemConflict(
            {original: {_id: 3, value: 'b'}, local: Deleted, server: {_id: 3, value: 'a'}},
            2,
          ),
          arrayConflict({
            original: toEntityList([1, 2, {_id: 3, value: 'b'}, 4, 5]),
            server: toEntityList([1, 2, {_id: 3, value: 'a'}, 4, 5]),
            local: toEntityList([1, 2, 4, 5]),
          })
        ],
      }))
    })
    test('complex removals', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [2, 4],
        nonConflictingModifications: [2, 4],
        conflicts: [],
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
      modifications: [6, 1, 2, 4, 8, 7],
      nonConflictingModifications: [6, 1, 2, 4, 8, 7],
      conflicts: [],
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
        modifications: [1, 5, 2, 3, 4],
        nonConflictingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      }))
    })
    test('moving on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 3, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 5, 2, 3, 4],
        nonConflictingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      }))
    })
    test('swapping next to each other locally', () => {
      expect(doMerge({
        original: [1, 2, 3],
        server: [1, 2, 3],
        local: [1, 3, 2],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [1, 3, 2],
        nonConflictingModifications: [1, 3, 2],
        conflicts: [],
      }))
    })
    test('swapping far from each other locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4],
        server: [1, 2, 3, 4],
        local: [4, 2, 3, 1],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [4, 2, 3, 1],
        nonConflictingModifications: [4, 2, 3, 1],
        conflicts: [],
      }))
    })
    test('swapping next to each other on server', () => {
      expect(doMerge({
        original: [1, 2, 3],
        server: [1, 3, 2],
        local: [1, 2, 3],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 3, 2],
        nonConflictingModifications: [1, 3, 2],
        conflicts: [],
      }))
    })
    test('swapping far from each other on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4],
        server: [4, 2, 3, 1],
        local: [1, 2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [4, 2, 3, 1],
        nonConflictingModifications: [4, 2, 3, 1],
        conflicts: [],
      }))
    })

    test('identical moving on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 5, 2, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 5, 2, 3, 4],
        nonConflictingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      }))
    })

    test('different moves on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 4, 3, 5],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [1, 5, 2, 4, 3],
        nonConflictingModifications: [1, 5, 2, 4, 3],
        conflicts: [],
      }))
    })

    test('complex moves', () => {
      expect(doMerge({
        original: '1234567890',
        server: '412567890',
        local: '245167890',
      })).toMatchObject(mergeResult({
        state: 'CONFLICT',
        modifications: '245167890',
        nonConflictingModifications: '425167890',
        conflicts: [
          arrayConflict({
            original: toEntityList('1234567890'),
            server: toEntityList('412567890'),
            local: toEntityList('245167890'),
          })
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
        modifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        nonConflictingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
      }))
    })
    test('modifying on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 8}],
        local: [1, 2, 3, 4, {_id: 5, value: 5}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        nonConflictingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
      }))
    })
    test('modifying on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 8}],
        local: [1, 2, 3, 4, {_id: 5, value: 8}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        nonConflictingModifications: [1, 2, 3, 4, {_id: 5, value: 8}],
        conflicts: [],
      }))
    })

    test('modifying and moving on server', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, {_id: 5, value: 8}, 3, 4],
        local: [1, 2, 3, 4, {_id: 5, value: 5}],
      })).toMatchObject(mergeResult({
        state: 'IN_SYNC',
        modifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        nonConflictingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
      }))
    })

    test('modifying and moving locally', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, 3, 4, {_id: 5, value: 5}],
        local: [1, 2, {_id: 5, value: 8}, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        nonConflictingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
      }))
    })

    test('modifying and moving on both', () => {
      expect(doMerge({
        original: [1, 2, 3, 4, {_id: 5, value: 5}],
        server: [1, 2, {_id: 5, value: 5}, 3, 4],
        local: [1, 2, {_id: 5, value: 8}, 3, 4],
      })).toMatchObject(mergeResult({
        state: 'MODIFIED_LOCALLY',
        modifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        nonConflictingModifications: [1, 2, {_id: 5, value: 8}, 3, 4],
        conflicts: [],
      }))
    })
  })

  test('tough cases 1', () => {
    expect(doMerge({
      original: [1, 2, 3, 4, 5],
      server: [1, 4, 5, 6],
      local: [1, {_id: 2}, {_id: 3}, 4],
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      modifications: [1, {_id: 2}, {_id: 3}, 4, 6],
      nonConflictingModifications: [1, 4, 6],
      conflicts: [
        removedArrayItemConflict(
          {original: {_id: 2, value: 2}, local: {_id: 2}, server: Deleted},
          1,
        ),
        removedArrayItemConflict(
          {original: {_id: 3, value: 3}, local: {_id: 3}, server: Deleted},
          2,
        ),
        arrayConflict({
          original: toEntityList([1, 2, 3, 4, 5]),
          server: toEntityList([1, 4, 5, 6]),
          local: toEntityList([1, {_id: 2}, {_id: 3}, 4]),
        }),
      ],
    }))
  })

  test('tough cases 3', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [6, 1, 4, 2, 3, 55, 66],
      local: [5, 1, 2, 3],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [6, 5, 1, 2, 3, 55, 66],
      nonConflictingModifications: [6, 5, 1, 2, 3, 55, 66],
      conflicts: [],
    }))
  })

  test('tough cases 4', () => {
    expect(doMerge({
      original: [1, 2, 3],
      server: [6, 1, 3, 2, 55, 66],
      local: [5, 1, 3],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [6, 5, 1, 3, 55, 66],
      nonConflictingModifications: [6, 5, 1, 3, 55, 66],
      conflicts: [],
    }))
  })

  test('tough cases 5', () => {
    expect(doMerge({
      original: [4, 5, 11, 22, 33],
      server: [4, 5, 6, 7, 8, 9, 11, 22, 33],
      local: [4, 10, 11, 22, 33],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [4, 6, 7, 8, 9, 10, 11, 22, 33],
      nonConflictingModifications: [4, 6, 7, 8, 9, 10, 11, 22, 33],
      conflicts: [],
    }))
  })

  test('tough cases 6', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, 9, 2, 8, 3, 7, 4, 6],
      local: [1, 11, 2, 3, 4],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [1, 9, 11, 2, 8, 3, 7, 4, 6],
      nonConflictingModifications: [1, 9, 11, 2, 8, 3, 7, 4, 6],
      conflicts: [],
    }))
  })
  test('tough cases 6B', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, 9,  2, 8, 3, 7, 4, 6],
      local:  [1, 11, 2, 3, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [1, 9, 11, 2, 8, 3, 7, 4, 6, 10],
      nonConflictingModifications: [1, 9, 11, 2, 8, 3, 7, 4, 6, 10],
      conflicts: [],
    }))
  })
  test('tough cases 6Bb', () => {
    expect(doMerge({
      original: [3, 4],
      server: [8, 3, 7, 4, 6],
      local:  [3, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [8, 3, 7, 4, 6, 10],
      nonConflictingModifications: [8, 3, 7, 4, 6, 10],
      conflicts: [],
    }))
  })
  test('tough cases 6C', () => {
    expect(doMerge({
      original: [1, 2, 3, 4],
      server: [1, {_id: 9, value: 9}, 2, 8, 3, 7, 4, 6],
      local: [1, 11, 2, 3, 12, 4, 10],
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: [1, 9, 11, 2, 8, 3, 7, 12, 4, 6, 10],
      nonConflictingModifications: [1, 9, 11, 2, 8, 3, 7, 12, 4, 6, 10],
      conflicts: [],
    }))
  })

  test('tough cases 7', () => {
    expect(doMerge({
      original: 'TKQNFBP',
      server: 'KQTNJPFS',
      local: 'TKMNJPFX',
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: 'KMTNJPFSX',
      nonConflictingModifications: 'KMTNJPFSX',
      conflicts: [],
    }))
  })

  test('tough cases 8', () => {
    expect(doMerge({
      original: 'ABC',
      server: 'BAC',
      local: 'ACB',
    })).toMatchObject(mergeResult({
      state: 'CONFLICT',
      modifications: 'ACB',
      nonConflictingModifications: 'BAC',
      conflicts: [
        arrayConflict({
          original: toEntityList('ABC'),
          server: toEntityList('BAC'),
          local: toEntityList('ACB'),
        })
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
      modifications: 'bacxACB',
      nonConflictingModifications: 'acbxBAC',
      conflicts: [
        arrayConflict({
          original: toEntityList('ABCxabc'),
          server: toEntityList('acbxBAC'),
          local: toEntityList('ACBxbac'),
        })
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
      modifications: 'ADECFB',
      nonConflictingModifications: 'ADECFB',
      conflicts: [],
    }))
  })

  test('tough cases 9B', () => {
    expect(doMerge({
      original: 'ABCDEF',
      server: 'ACXDEFB',
      local: 'AYBDECF',
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: 'AYDECXFB',
      nonConflictingModifications: 'AYDECXFB',
      conflicts: [],
    }))
  })

  test('tough cases 9C', () => {
    expect(doMerge({
      original: 'ABCDEF',
      server: 'ACXZDEFB',
      local: 'AYWBDECF',
    })).toMatchObject(mergeResult({
      state: 'MODIFIED_LOCALLY',
      modifications: 'AYWDECXZFB',
      nonConflictingModifications: 'AYWDECXZFB',
      conflicts: [],
    }))
  })

  describe.each([
    [0],
    [1],
    [2],
    [3],
    [4],
  ])('random stability tests (seed = %i)', (seed) => {
    let random
    beforeEach(() => {
      random = randomGeneratorWithSeed(seed)
    })

    function testStability(original: Entity[], v1: Entity[], v2: Entity[]) {
      mergeArrays({original, server: v2, local: v1}, merge)
    }

    test('random adding', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = changedVersion(original, random, { add: random()*20 })
      const version2 = changedVersion(original, random, { add: random()*20 })

      testStability(original, version, version2)
    })

    test('random removals', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = changedVersion(original, random, { remove: random()*8 })
      const version2 = changedVersion(original, random, { remove: random()*8 })

      testStability(original, version, version2)
    })

    test('random moving', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = changedVersion(original, random, { move: random()*8 })
      const version2 = changedVersion(original, random, { move: random()*8 })

      testStability(original, version, version2)
    })

    test('random everything', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = changedVersion(original, random, {
        add: random()*20,
        remove: random()*8,
        move: random()*8,
      })
      const version2 = changedVersion(original, random, {
        add: random()*20,
        remove: random()*8,
        move: random()*8,
      })

      testStability(original, version, version2)
    })
  })
})
