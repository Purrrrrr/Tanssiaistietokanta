import merge from './mergeValues'

describe('merge', () => {

  test('no changes', () => {
    expect(merge({
      original: {a: 1, b: 1},
      server: {a: 1, b: 1},
      local: {a: 1, b: 1},
    })).toEqual({
      state: 'IN_SYNC',
      modifications: {a: 1, b: 1},
      nonConflictingModifications: {a: 1, b: 1},
      conflicts: [],
      patch: [],
      changes: null,
    })
  })

  test('local changes', () => {
    expect(merge({
      original: 1,
      server: 1,
      local: 2,
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: 2,
      nonConflictingModifications: 2,
      conflicts: [],
      patch: [
        {op: 'replace', path: '', value: 2}
      ],
      changes: {
        type: 'scalar',
        changedValue: 2,
      },
    })
  })

  test('server changes', () => {
    expect(merge({
      original: 1,
      server: 2,
      local: 1,
    })).toEqual({
      state: 'IN_SYNC',
      modifications: 2,
      nonConflictingModifications: 2,
      conflicts: [],
      patch: [],
      changes: null,
    })
  })

  test('local object changes', () => {
    expect(merge({
      original: {value: 1},
      server: {value: 1},
      local: {value: 2},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {value: 2},
      nonConflictingModifications: {value: 2},
      conflicts: [],
      patch: [
        {op: 'replace', path: '/value', value: 2}
      ],
      changes: {
        type: 'object',
        changes: {
          value: {
            type: 'scalar',
            changedValue: 2,
          },
        },
      }
    })
  })

  test('server object changes', () => {
    expect(merge({
      original: {value: 1},
      server: {value: 2},
      local: {value: 1},
    })).toEqual({
      state: 'IN_SYNC',
      modifications: {value: 2},
      nonConflictingModifications: {value: 2},
      conflicts: [],
      patch: [],
      changes: null,
    })
  })

  test('recursive changes', () => {
    expect(merge({
      original: {a: 1, b: {value: 1}},
      server: {a: 1, b: {value: 1}},
      local: {a: 1, b: {value: 3}},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {a: 1, b: {value: 3}},
      nonConflictingModifications: {a: 1, b: {value: 3}},
      conflicts: [],
      patch: [
        {op: 'replace', path: '/b/value', value: 3}
      ],
      changes: {
        type: 'object',
        changes: {
          b: {
            type: 'object',
            changes: {
              value: {
                type: 'scalar',
                changedValue: 3,
              },
            },
          },
        },
      }
    })
  })

  test('recursive conflicts', () => {
    expect(merge({
      original: {a: 1, b: {value: 1}},
      server: {a: 1, b: {value: 2}},
      local: {a: 1, b: {value: 3}},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1, b: {value: 3}},
      nonConflictingModifications: {a: 1, b: {value: 2}},
      conflicts: [
        ['b', 'value'],
      ],
      patch: [],
      changes: {
        type: 'object',
        changes: {
          b: {
            type: 'object',
            changes: {
              value: {
                type: 'scalar',
                changedValue: 2,
                conflictingLocalValue: 3,
              },
            },
          },
        },
      }
    })
  })

  test('recursive conflicts 2', () => {
    expect(merge({
      original: {a: 1, b: {value: 1, val: 2, obj: {a: 1}}},
      server: {a: 1, b: undefined},
      local: {a: 1, b: {value: 3, val: 2, obj: {a: 1}}},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1, b: {value: 3, val: 2, obj: {a: 1}}},
      nonConflictingModifications: {a: 1, b: undefined},
      conflicts: [
        ['b'],
      ],
      patch: [],
      changes: {
        type: 'object',
        changes: {
          b: {
            type: 'scalar',
            changeValue: undefined,
            conflictingLocalValue: {value: 3, val: 2, obj: {a: 1}},
          },
        },
      }
    })
  })

  test('recursive non-conflicts 3', () => {
    expect(merge({
      original: {a: 1, b: [{_id: 1}, {_id: 2}, {_id: 3}]},
      server: {a: 1, b: [{_id: 2}, {_id: 3}, {_id: 1}]},
      local: {a: 1, b: [{_id: 2}, {_id: 3}]},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {a: 1, b: [{_id: 2}, {_id: 3}]},
      nonConflictingModifications: {a: 1, b: [{_id: 2}, {_id: 3}]},
      conflicts: [],
      patch: [],
      changes: {
        type: 'object',
        changes: {
          b: {
            type: 'array',
            itemModifications: new Map(),
          },
        },
      }
    })
  })

  test('recursive conflicts 5', () => {
    expect(merge({
      original: {a: 1, b: [{_id: 1}, {_id: 2}, {_id: 0, a: 1, b: 2}]},
      server: {a: 1, b: [{_id: 2}, {_id: 0, a: 2, b: 2}]},
      local: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
      nonConflictingModifications: {a: 1, b: [{_id: 2}, {_id: 0, a: 2, b: 2}]},
      conflicts: [
        ['b', 1, 'a'],
      ],
      patch: [],
      changes: {
        type: 'object',
        changes: {
          b: {
            type: 'array',
            itemModifications: new Map([
              [0, {
                type: 'object',
                changes: {
                  a: {
                    type: 'scalar',
                    changedValue: 2,
                    conflictingLocalValue: 0,
                  }
                },
              }]
            ]),
          }
        },
      }
    })
  })
})
