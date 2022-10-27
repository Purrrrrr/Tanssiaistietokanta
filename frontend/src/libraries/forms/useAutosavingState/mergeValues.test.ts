import merge from './mergeValues'

describe('merge', () => {

  test('no changes', () => {
    expect(merge({
      original: {a: 1, b: 1},
      server: {a: 1, b: 1},
      local: {a: 1, b: 1},
    })).toEqual({
      state: 'IN_SYNC',
      pendingModifications: {a: 1, b: 1},
      conflicts: [],
    })
  })

  test('local changes', () => {
    expect(merge({
      original: 1,
      server: 1,
      local: 2,
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: 2,
      conflicts: [],
    })
  })

  test('server changes', () => {
    expect(merge({
      original: 1,
      server: 2,
      local: 1,
    })).toEqual({
      state: 'IN_SYNC',
      pendingModifications: 2,
      conflicts: [],
    })
  })

  test('local object changes', () => {
    expect(merge({
      original: {value: 1},
      server: {value: 1},
      local: {value: 2},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: {value: 2},
      conflicts: [],
    })
  })

  test('server object changes', () => {
    expect(merge({
      original: {value: 1},
      server: {value: 2},
      local: {value: 1},
    })).toEqual({
      state: 'IN_SYNC',
      pendingModifications: {value: 2},
      conflicts: [],
    })
  })

  test('recursive changes', () => {
    expect(merge({
      original: {a: 1, b: {value: 1}},
      server: {a: 1, b: {value: 1}},
      local: {a: 1, b: {value: 3}},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      pendingModifications: {a: 1, b: {value: 3}},
      conflicts: [],
    })
  })

  test('recursive conflicts', () => {
    expect(merge({
      original: {a: 1, b: {value: 1}},
      server: {a: 1, b: {value: 2}},
      local: {a: 1, b: {value: 3}},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: {value: 3}},
      conflicts: [
        ['b', 'value'],
      ],
    })
  })

  test('recursive conflicts 2', () => {
    expect(merge({
      original: {a: 1, b: {value: 1, val: 2, obj: {a: 1}}},
      server: {a: 1, b: undefined},
      local: {a: 1, b: {value: 3, val: 2, obj: {a: 1}}},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: {value: 3, val: 2, obj: {a: 1}}},
      conflicts: [
        ['b'],
      ],
    })
  })

  test('recursive conflicts 3', () => {
    expect(merge({
      original: {a: 1, b: [1, 2, 3]},
      server: {a: 1, b: [2, 3, 1]},
      local: {a: 1, b: [2, 3]},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: [2, 3]},
      conflicts: [
        ['b'],
      ],
    })
  })

  test('recursive conflicts 5', () => {
    expect(merge({
      original: {a: 1, b: [1, 2, {id: 0, a: 1, b: 2}]},
      server: {a: 1, b: [2, {id: 0, a: 2, b: 2}]},
      local: {a: 1, b: [2, {id: 0, a: 0, b: 2}]},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: [2, {id: 0, a: 0, b: 2}]},
      conflicts: [
        ['b', 2, 'a'],
      ],
    })
  })
})
