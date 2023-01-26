import {Entity, mapMergeData, MergeData, MergeResult, objectChange, scalarChange} from './types'

import {mergeArrays} from './mergeArrays2'
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

function mapChangeSet(changes) {
  if (changes === null) return null
  return changes
}

function mergeResult({patch, conflicts, ...res}: MergeResult<DummyEntityList>): Partial<MergeResult<Entity[]>> {
  return {
    ...res,
    modifications: toEntityList(res.modifications),
    nonConflictingModifications: toEntityList(res.nonConflictingModifications),
    changes: mapChangeSet(res.changes),
    //modifications: toEntityList(res.modifications),
    //nonConflictingModifications: toEntityList(res.nonConflictingModifications),
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
      modifications: [1, 2, 3, 4, 5],
      nonConflictingModifications: [1, 2, 3, 4, 5],
      conflicts: [],
      patch: [],
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
        conflicts: [],
        patch: [
          {op: 'add', path: '/5', value: 6}
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [],
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
        conflicts: [],
        patch: [
          {op: 'add', path: '/7', value: 6},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [],
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
        conflicts: [],
        patch: [
          {op: 'test', path: '/2', value: 3},
          {op: 'remove', path: '/2'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [],
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
        conflicts: [
          [],
        ],
        patch: [],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [
          {op: 'test', path: '/0', value: 1},
          {op: 'remove', path: '/0'},
          {op: 'test', path: '/2', value: 5},
          {op: 'remove', path: '/2'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
      patch: [
        {op: 'test', path: '/4', value: 5},
        {op: 'remove', path: '/4'},
        {op: 'add', path: '/4', value: 7},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
        patch: [
          {op: 'test', path: '/4', value: 5},
          {op: 'move', from: '/4', path: '/1'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [],
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
        conflicts: [],
        patch: [
          {op: 'test', path: '/1', value: 2},
          {op: 'move', from: '/1', path: '/2'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [
          {op: 'test', path: '/0', value: 1},
          {op: 'move', from: '/0', path: '/2'},
          {op: 'test', path: '/3', value: 4},
          {op: 'move', from: '/3', path: '/0'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [],
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
        conflicts: [],
        patch: [],
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
        conflicts: [],
        patch: [],
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
        conflicts: [],
        patch: [
          {op: 'test', path: '/3', value: 3},
          {op: 'move', from: '/3', path: '/4'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        conflicts: [],
        patch: [
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([]),
        },
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
        patch: [
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'replace', path: '/4/value', value: 8},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([
            [5, objectChange({
              value: scalarChange(8),
            })]
          ]),
        },
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
        patch: [],
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
        conflicts: [],
        patch: [],
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
        conflicts: [],
        patch: [],
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
        conflicts: [],
        patch: [
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'replace', path: '/4/value', value: 8},
          {op: 'test', path: '/4/_id', value: 5},
          {op: 'move', path: '/2', from: '/4'},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([
            [5, objectChange({
              value: scalarChange(8),
            })]
          ]),
        },
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
        patch: [
          {op: 'test', path: '/2/_id', value: 5},
          {op: 'replace', path: '/2/value', value: 8},
        ],
        changes: {
          type: 'array',
          itemModifications: new Map([
            [5, objectChange({
              value: scalarChange(8),
            })]
          ]),
        },
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
        [],
      ],
      patch: [
        {op: 'test', path: '/2', value: 5},
        {op: 'remove', path: '/2'},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'add', path: '/0', value: 5},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      conflicts: [
        [],
      ],
      patch: [
        {op: 'add', path: '/0', value: 5},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'test', path: '/1', value: 5},
        {op: 'remove', path: '/1'},
        {op: 'add', path: '/1', value: 10},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'add', path: '/1', value: 11},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'add', path: '/1', value: 11}, {op: 'add', path: '/9', value: 10},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'add', path: '/4', value: 10},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [
        {op: 'add', path: '/1', value: 11},
        {op: 'add', path: '/7', value: 12},
        {op: 'add', path: '/10', value: 10},
      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      conflicts: [],
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      conflicts: [],
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
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
      patch: [

      ],
      changes: {
        type: 'array',
        itemModifications: new Map([]),
      },
    }))
  })

  describe.each([
    [0],
    [1],
    [2],
    [3],
    [4],
  ])('random stability tests (seed = %i)', (seed) => {
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

    function testStability(original: Entity[], v1: Entity[], v2: Entity[]) {
      mergeArrays({original, server: v2, local: v1}, merge)
    }

    test('random adding', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = [...original]
      repeatIn(version, random()*20, addRandom)
      const version2 = [...original]
      repeatIn(version2, random()*20, addRandom)


      testStability(original, version, version2)
    })

    test('random removals', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = [...original]
      repeatIn(version, random()*8, removeRandom)
      const version2 = [...original]
      repeatIn(version2, random()*8, removeRandom)

      testStability(original, version, version2)
    })

    test('random moving', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = [...original]
      repeatIn(version, random()*8, moveRandom)
      const version2 = [...original]
      repeatIn(version2, random()*8, moveRandom)
      //console.log({original, version, version2})

      testStability(original, version, version2)
    })

    test('random everything', () => {
      const original = [1, 2, 4, 5, 6, 7, 8, 9, 10].map(toEntity)
      const version = [...original]
      repeatIn(version, random()*20, addRandom)
      repeatIn(version, random()*8, removeRandom)
      repeatIn(version, random()*8, moveRandom)
      const version2 = [...original]
      repeatIn(version2, random()*20, addRandom)
      repeatIn(version2, random()*8, removeRandom)
      repeatIn(version2, random()*8, moveRandom)

      testStability(original, version, version2)
    })
  })
})
