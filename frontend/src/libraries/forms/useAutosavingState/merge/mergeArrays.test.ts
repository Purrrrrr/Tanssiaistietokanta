import {changedVersion, map, randomGeneratorWithSeed, toEntity} from '../testUtils'
import {arrayChange, ArrayChangeSet, conflictingArrayChange, Entity, ID, mapMergeData, MergeData, MergeResult, objectChange, scalarChange} from '../types'
import merge from './index'
import {mergeArrays} from './mergeArrays'

type DummyEntity= Entity | number
type DummyEntityList = DummyEntity[] | string

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

function added(...arr: ID[]): Map<ID, Entity> {
  return new Map<ID, Entity>(
    arr.map(id => [id, toEntity(id)]),
  )
}

function mergeResult(res: {changes: null | ArrayChangeSet<Entity>} & Omit<MergeResult<DummyEntityList>, 'changes'>): Partial<MergeResult<Entity[]>> {
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
      changes: null,
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [1, 2, 3, 4, 5, 6],
          added(6),
        ),
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
        changes: null,
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [8, 7, 1, 2, 3, 4, 5, 6],
          added(6),
        ),
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
        changes: null,
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [1, 2, 4, 5]
        ),
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
        changes: null,
      }))
    })
    test('removal of modified value', () => {
      expect(doMerge({
        original: [1, 2, {_id: 3, value: 'b'}, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, {_id: 3, value: 'a'}, 4, 5],
      })).toMatchObject(mergeResult({
        state: 'CONFLICT',
        modifications: [1, 2, {_id: 3, value: 'a'}, 4, 5],
        nonConflictingModifications: [1, 2, 4, 5],
        changes: conflictingArrayChange(
          map(),
          {original: [1, 2, 3, 4, 5], local: [1, 2, 3, 4, 5], server: [1, 2, 4, 5]}
        ),
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [2, 4],
        ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3, 4, 5],
        [6, 1, 2, 4, 8, 7],
        added(7)
      ),
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [1, 5, 2, 3, 4],
        ),
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
        changes: null,
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
        changes: arrayChange(
          map(),
          [1, 2, 3],
          [1, 3, 2],
        ),
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4],
          [4, 2, 3, 1],
        ),
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
        changes: null,
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
        changes: null,
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
        changes: null,
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
        changes: arrayChange(
          map(),
          [1, 2, 3, 4, 5],
          [1, 5, 2, 4, 3],
        ),
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
        changes: conflictingArrayChange(
          map(),
          {
            original: '1234567890'.split(''),
            server: '425167890'.split(''),
            local: '245167890'.split(''),
          }
        ),
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
        changes: arrayChange<any>(
          map(
            [5, objectChange({
              value: scalarChange(8),
            })]
          ),
          [1, 2, 3, 4, 5],
          [1, 2, 3, 4, 5],
        ),
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
        changes: null,
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
        changes: null,
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
        changes: null,
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
        changes: arrayChange<any>(
          map(
            [5, objectChange({
              value: scalarChange(8),
            })]
          ),
          [1, 2, 3, 4, 5],
          [1, 2, 5, 3, 4],
        ),
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
        changes: arrayChange<any>(
          map(
            [5, objectChange({
              value: scalarChange(8),
            })]
          ),
          [1, 2, 3, 4, 5],
          [1, 2, 5, 3, 4],
        ),
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
      changes: conflictingArrayChange(
        map(),
        {
          original: [1, 2, 3, 4, 5],
          server: [1, 4, 6],
          local: [1, 2, 3, 4, 6],
        }
      ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3, 4],
        [6, 5, 1, 2, 3, 55, 66],
        added(5)
      ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3],
        [6, 5, 1, 3, 55, 66],
        added(5),
      ),
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
      changes: arrayChange(
        map(),
        [4, 5, 11, 22, 33],
        [4, 6, 7, 8, 9, 10, 11, 22, 33],
        added(10)
      ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3, 4],
        [1, 9, 11, 2, 8, 3, 7, 4, 6],
        added(11)
      ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3, 4],
        [1, 9, 11, 2, 8, 3, 7, 4, 6, 10],
        added(10, 11)
      ),
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
      changes: arrayChange(
        map(),
        [3, 4],
        [8, 3, 7, 4, 6, 10],
        added(10)
      ),
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
      changes: arrayChange(
        map(),
        [1, 2, 3, 4],
        [1, 9, 11, 2, 8, 3, 7, 12, 4, 6, 10],
        added(11, 12, 10)
      ),
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
      changes: arrayChange(
        map(),
        'TKQNFBP'.split(''),
        'KMTNJPFSX'.split(''),
        added('M', 'X')
      ),
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
      changes: conflictingArrayChange(
        map(),
        {
          original: 'ABC'.split(''),
          local: 'ACB'.split(''),
          server: 'BAC'.split(''),
        }
      ),
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
      changes: conflictingArrayChange(
        map(),
        {
          original: 'ABCxabc'.split(''),
          local: 'bacxACB'.split(''),
          server: 'acbxBAC'.split(''),
        }
      ),
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
      changes: arrayChange(
        map(),
        'ABCDEF'.split(''),
        'ADECFB'.split(''),
      ),
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
      changes: arrayChange(
        map(),
        'ABCDEF'.split(''),
        'AYDECXFB'.split(''),
        added(
          'Y'
        )
      ),
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
      changes: arrayChange(
        map(),
        'ABCDEF'.split(''),
        'AYWDECXZFB'.split(''),
        added(
          ...'YW'.split('')
        ),
      ),
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
