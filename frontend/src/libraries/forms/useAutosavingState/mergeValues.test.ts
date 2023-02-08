import {arrayChange, conflictingScalarChange, objectChange, scalarChange} from './types'

import merge from './mergeValues'
import {map} from './testUtils'

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
      patch: [
        {op: 'replace', path: '', value: 2}
      ],
      changes: scalarChange(2),
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
      patch: [
        {op: 'replace', path: '/value', value: 2}
      ],
      changes: objectChange({
        value: scalarChange(2),
      })
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
      patch: [
        {op: 'replace', path: '/b/value', value: 3}
      ],
      changes: objectChange({
        b: objectChange({
          value: scalarChange(3),
        }),
      }),
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
      patch: [],
      changes: objectChange({
        b: objectChange({
          value: conflictingScalarChange({local: 3, server: 2}),
        }),
      }),
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
      patch: [],
      changes: objectChange<any>({
        b: conflictingScalarChange({
          server: undefined,
          local: {value: 3, val: 2, obj: {a: 1}}
        }),
      }),
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
      patch: [],
      changes: objectChange<any>({
        b: arrayChange(
          map(),
          [1, 2, 3],
          [2, 3],
        ),
      }),
    })
  })

  test('recursive conflicts 4', () => {
    expect(merge({
      original: {a: 1, b: [{_id: 1}, {_id: 2}, {_id: 0, a: 1, b: 2}]},
      server: {a: 1, b: [{_id: 2}, {_id: 0, a: 2, b: 2}]},
      local: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1, b: [{_id: 2}, {_id: 0, a: 0, b: 2}]},
      nonConflictingModifications: {a: 1, b: [{_id: 2}, {_id: 0, a: 2, b: 2}]},
      patch: [],
      changes: objectChange<any>({
        b: arrayChange(
          map(
            [0, objectChange({
              a: conflictingScalarChange({local: 0, server: 2})
            })]
          ),
          [1, 2, 0],
          [2, 0],
        )
      }),
    })
  })
})
