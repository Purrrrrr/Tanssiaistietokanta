import {MergeFunction} from './types'

import {mergeArrays} from './mergeArrays'

describe('mergeArrays', () => {
  const merge : MergeFunction = (data) => ({ state: 'IN_SYNC', conflicts: [], pendingModifications: data.local })

  test('no changes', () => {
    expect(mergeArrays({
      original: [1, 2, 3, 4, 5],
      server: [1, 2, 3, 4, 5],
      local: [1, 2, 3, 4, 5],
    }, merge)).toEqual({
      state: 'IN_SYNC',
      pendingModifications: [1, 2, 3, 4, 5],
      conflicts: [],
    })
  })

  describe('adding to lists', () => {
    test('simple additions locally', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 2, 3, 4, 5, 6],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
      })
    })
    test('simple additions on server', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, 6],
        local: [1, 2, 3, 4, 5],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
      })
    })
    test('complex additions', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [8, 7, 1, 2, 3, 4, 5],
        local: [1, 2, 3, 4, 5, 6],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [8, 7, 1, 2, 3, 4, 5, 6],
        conflicts: [],
      })
    })
    test('identical additions', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5, 6],
        local: [1, 2, 3, 4, 5, 6],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, 5, 6],
        conflicts: [],
      })
    })
  })

  describe('removing from lists', () => {
    test('simple removals locally', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 2, 4, 5],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 4, 5],
        conflicts: [],
      })
    })
    test('simple removals on server', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, 3, 4, 5],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 4, 5],
        conflicts: [],
      })
    })
    test('removal of modified value', () => {
      expect(mergeArrays({
        original: [1, 2, {id: 3, value: 'b'}, 4, 5],
        server: [1, 2, 4, 5],
        local: [1, 2, {id: 3, value: 'a'}, 4, 5],
      }, merge)).toEqual({
        state: 'CONFLICT',
        pendingModifications: [1, 2, {id: 3, value: 'a'}, 4, 5],
        conflicts: [
          [],
        ],
      })
    })
    test('complex removals', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 4, 5],
        local: [2, 3, 4],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [2, 4],
        conflicts: [],
      })
    })
  })

  test('additions and removals', () => {
    expect(mergeArrays({
      original: [1, 2, 3, 4, 5],
      server: [6, 1, 2, 4, 5, 8],
      local: [1, 2, 3, 4, 7],
    }, merge)).toEqual({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [6, 1, 2, 4, 7, 8],
      conflicts: [],
    })
  })

  describe('moving stuff around', () => {
    test('moving locally', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 2, 3, 4, 5],
        local: [1, 5, 2, 3, 4],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      })
    })
    test('moving on server', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 3, 4, 5],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      })
    })
    test('swapping next to each other', () => {
      expect(mergeArrays({
        original: [1, 2, 3],
        server: [1, 3, 2],
        local: [1, 2, 3],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 3, 2],
        conflicts: [],
      })
    })
    test('swapping far from each other', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4],
        server: [4, 2, 3, 1],
        local: [1, 2, 3, 4],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [4, 2, 3, 1],
        conflicts: [],
      })
    })

    test('identical moving on both', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 5, 2, 3, 4],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 5, 2, 3, 4],
        conflicts: [],
      })
    })

    test('different moves on both', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, 5],
        server: [1, 5, 2, 3, 4],
        local: [1, 2, 4, 3, 5],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 5, 2, 4, 3],
        conflicts: [],
      })
    })
  })

  describe('modifying items', () => {
    test('modifying locally', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, 3, 4, {id: 5, value: 5}],
        local: [1, 2, 3, 4, {id: 5, value: 8}],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, 3, 4, {id: 5, value: 8}],
        conflicts: [],
      })
    })
    test('modifying on server', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, 3, 4, {id: 5, value: 8}],
        local: [1, 2, 3, 4, {id: 5, value: 5}],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, {id: 5, value: 8}],
        conflicts: [],
      })
    })
    test('modifying on both', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, 3, 4, {id: 5, value: 8}],
        local: [1, 2, 3, 4, {id: 5, value: 8}],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, 3, 4, {id: 5, value: 8}],
        conflicts: [],
      })
    })

    test('modifying and moving on server', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, {id: 5, value: 8}, 3, 4],
        local: [1, 2, 3, 4, {id: 5, value: 5}],
      }, merge)).toEqual({
        state: 'IN_SYNC',
        pendingModifications: [1, 2, {id: 5, value: 8}, 3, 4],
        conflicts: [],
      })
    })

    test('modifying and moving locally', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, 3, 4, {id: 5, value: 5}],
        local: [1, 2, {id: 5, value: 8}, 3, 4],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, {id: 5, value: 8}, 3, 4],
        conflicts: [],
      })
    })

    test('modifying and moving on both', () => {
      expect(mergeArrays({
        original: [1, 2, 3, 4, {id: 5, value: 5}],
        server: [1, 2, {id: 5, value: 5}, 3, 4],
        local: [1, 2, {id: 5, value: 8}, 3, 4],
      }, merge)).toEqual({
        state: 'MODIFIED_LOCALLY',
        pendingModifications: [1, 2, {id: 5, value: 8}, 3, 4],
        conflicts: [],
      })
    })
  })

  test('tough cases #1', () => {
    expect(mergeArrays({
      original: [1, 2, 3, 4, 5],
      server: [1, 4, 5, 6],
      local: [1, {id: 2}, {id: 3}, 4],
    }, merge)).toEqual({
      state: 'CONFLICT',
      pendingModifications: [1, {id: 2}, {id: 3}, 4, 6],
      conflicts: [
        [],
      ],
    })
  })

  test('tough cases 3', () => {
    expect(mergeArrays({
      original: [1, 2, 3, 4],
      server: [6, 1, 4, 2, 3, 55, 66],
      local: [5, 1, 2, 3],
    }, merge)).toEqual({
      state: 'CONFLICT',
      pendingModifications: [5, 6, 1, 2, 3, 55, 66],
      conflicts: [
        [],
      ],
    })
  })

  test('tough cases 4', () => {
    expect(mergeArrays({
      original: [1, 2, 3],
      server: [6, 1, 3, 2, 55, 66],
      local: [5, 1, 3],
    }, merge)).toEqual({
      state: 'CONFLICT',
      pendingModifications: [5, 6, 1, 3, 55, 66],
      conflicts: [
        [],
      ],
    })
  })

  test('tough cases 5', () => {
    expect(mergeArrays({
      original: [4, 5, 11, 22, 33],
      server: [4, 5, 6, 7, 8, 9, 11, 22, 33],
      local: [4, 10, 11, 22, 33],
    }, merge)).toEqual({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: [4, 10, 6, 7, 8, 9, 11, 22, 33],
      conflicts: [],
    })
  })
})
