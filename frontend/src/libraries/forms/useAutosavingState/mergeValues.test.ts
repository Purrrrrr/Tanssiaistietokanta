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
      patch: [],
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
      patch: [
        {op: 'replace', path: '', value: 2}
      ],
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
      patch: [],
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
      patch: [
        {op: 'replace', path: '/value', value: 2}
      ],
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
      patch: [],
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
      patch: [
        {op: 'replace', path: '/b/value', value: 3}
      ],
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
      patch: [],
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
      patch: [],
    })
  })

  test('recursive conflicts 3', () => {
    expect(merge({
      original: {a: 1, b: [{_id: 1}, {_id: 2}, {_id: 3}]},
      server: {a: 1, b: [{_id: 2}, {_id: 3}, {_id: 1}]},
      local: {a: 1, b: [{_id: 2}, {_id: 3}]},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: [{_id: 2}, {_id: 3}]},
      conflicts: [
        ['b'],
      ],
      patch: [],
    })
  })

  test('recursive conflicts 5', () => {
    expect(merge({
      original: {a: 1, b: [{_id: 1}, {_id: 2}, {_id: 0, a: 1, b: 2}]},
      server: {a: 1, b: [{_id: 2}, {_id: 0, a: 2, b: 2}]},
      local: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
    })).toEqual({
      state: 'CONFLICT',
      pendingModifications: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
      conflicts: [
        ['b', 2, 'a'],
      ],
      patch: [],
    })
  })
})
