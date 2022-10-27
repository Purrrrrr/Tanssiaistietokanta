import {MergeableListItem} from './types'

import {getArrayChanges} from './arrayDiff'

describe('getArrayChanges', () => {

  test('no changes', () => {
    const changes = getArrayChanges([1, 2, 3], [1, 2, 3])

    changes.forEach((change, index) =>
      expect(change).toMatchObject({id: index+1, status: 'UNCHANGED'})
    )
  })

  test('simple removals', () => {
    const changes = getArrayChanges([1, 2, 3, 4, 5], [1, 3, 5])

    const statuses = {
      1: 'UNCHANGED',
      2: 'REMOVED',
      3: 'UNCHANGED',
      4: 'REMOVED',
      5: 'UNCHANGED'
    }
    changes.forEach((change) =>
      expect(change).toMatchObject({status: statuses[change.id as number]})
    )
  })

  test('simple adding', () => {
    const changes = getArrayChanges([1, 2, 3], [1, 4, 2, 3, 5])

    const statuses = {1: 'UNCHANGED', 2: 'UNCHANGED', 3: 'UNCHANGED', 4: 'ADDED', 5: 'ADDED'}
    changes.forEach((change) =>
      expect(change).toMatchObject({status: statuses[change.id as number]})
    )
  })

  test('adding and removing', () => {
    const changes = getArrayChanges([1, 2, 3, 4, 5], [6, 1, 3, 5, 8])

    const expectedChanges = {
      1: { status: 'UNCHANGED'},
      2: { status: 'REMOVED', from: 1},
      3: { status: 'UNCHANGED'},
      4: { status: 'REMOVED', from: 3},
      5: { status: 'UNCHANGED'},
      6: { status: 'ADDED', to: 0},
      8: { status: 'ADDED', to: 4},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  test('moving', () => {
    const changes = getArrayChanges([1, 2, 3, 4, 5], [5, 1, 3, 4, 2])

    const expectedChanges = {
      1: { status: 'MOVED', moveAmount: 0},
      2: { status: 'MOVED', from: 1, to: 4, moveAmount: 2},
      3: { status: 'UNCHANGED', moveAmount: 0},
      4: { status: 'UNCHANGED', moveAmount: 0},
      5: { status: 'MOVED', from: 4, to: 0, moveAmount: -4},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  test('swapping two values next to each other', () => {
    const changes = getArrayChanges([1, 2, 3, 4, 5], [1, 3, 2, 4, 5])

    const expectedChanges = {
      1: { status: 'UNCHANGED'},
      2: { status: 'MOVED', from: 1, to: 2, moveAmount: 1},
      3: { status: 'MOVED', from: 2, to: 1, moveAmount: -1},
      4: { status: 'UNCHANGED'},
      5: { status: 'UNCHANGED'},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  test('swapping two values far from each other', () => {
    const changes = getArrayChanges([1, 2, 3, 4, 5], [5, 2, 3, 4, 1])

    const expectedChanges = {
      1: { status: 'MOVED', from: 0, to: 4, moveAmount: 3},
      2: { status: 'UNCHANGED'},
      3: { status: 'UNCHANGED'},
      4: { status: 'UNCHANGED'},
      5: { status: 'MOVED', from: 4, to: 0, moveAmount: -4},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  test('many changes at once', () => {
    const changes = getArrayChanges<MergeableListItem>(
      [{_id: 1}, 11, 22, 33, 2, 3, 4, 5, 6, 7],
      [0, 1, {_id: 6}, 2, 7, 66, 3, 4, 5, 11, 22, 33]
    )

    const expectedChanges = {
      0: { status: 'ADDED'},
      1: { status: 'MODIFIED'},
      2: { status: 'MOVED', moveAmount: 0},
      3: { status: 'MOVED', moveAmount: 0},
      4: { status: 'MOVED', moveAmount: 0},
      5: { status: 'MOVED', moveAmount: 0},
      6: { status: 'MOVED_AND_MODIFIED', from: 8, to: 2, moveAmount: -7},
      7: { status: 'MOVED', from: 9, to: 4, moveAmount: -6},
      11: { status: 'MOVED', from: 1, to: 9, moveAmount: 4},
      22: { status: 'MOVED', from: 2, to: 10, moveAmount: 4},
      33: { status: 'MOVED', from: 3, to: 11, moveAmount: 4},
      66: { status: 'ADDED'},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  test('many changes at once 2', () => {
    const changes = getArrayChanges<MergeableListItem>(
      [{_id: 1}, 11, 22, 33, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, {_id: 7}, 2, 8, 66, 4, 5, 6, 11, 22, 33]
    )

    const expectedChanges = {
      0: { status: 'ADDED'},
      1: { status: 'MODIFIED'},
      2: { status: 'MOVED', moveAmount: 0},
      3: { status: 'REMOVED'},
      4: { status: 'MOVED', moveAmount: 0},
      5: { status: 'MOVED', moveAmount: 0},
      6: { status: 'MOVED', moveAmount: 0},
      7: { status: 'MOVED_AND_MODIFIED', from: 9, to: 2, moveAmount: -7},
      8: { status: 'MOVED', from: 10, to: 4, moveAmount: -6},
      11: { status: 'MOVED', from: 1, to: 9, moveAmount: 4},
      22: { status: 'MOVED', from: 2, to: 10, moveAmount: 4},
      33: { status: 'MOVED', from: 3, to: 11, moveAmount: 4},
      66: { status: 'ADDED'},
    }
    expectChangesToMatch(changes, expectedChanges)
  })

  function expectChangesToMatch(changes, expectedChanges) {
    expect(changes).toEqual(
      changes.map(({id}) =>
        expect.objectContaining({id, ...expectedChanges[id]})
      )
    )
  }
})
