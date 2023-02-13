import {map} from '../testUtils'
import {arrayChange, conflictingScalarChange, objectChange, removedKey, removedOnLocalWithServerModification, removedOnServerWithLocalModification, scalarChange} from '../types'
import merge from './index'

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
      changes: objectChange<any>({
        b: arrayChange(
          map(),
          [1, 2, 3],
          [2, 3],
        ),
      }),
    })
  })

  test('different added objects', () => {
    expect(merge({
      original: undefined,
      server: {a: 1, b: 2},
      local: {a: 1, c: 3},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {a: 1, b: 2, c: 3},
      nonConflictingModifications: {a: 1, b: 2, c: 3},
      changes: objectChange<any>(
        {},
        {
          c: 3
        },
      ),
    })
  })

  test('add keys to object', () => {
    expect(merge({
      original: {a: 1},
      server: {a: 1, b: 2},
      local: {a: 1, c: 3},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {a: 1, b: 2, c: 3},
      nonConflictingModifications: {a: 1, b: 2, c: 3},
      changes: objectChange<any>(
        {},
        {
          c: 3
        },
      ),
    })
  })

  test('remove keys from object', () => {
    expect(merge({
      original: {a: 1, b: 2},
      server: {a: 1, b: 2},
      local: {a: 1},
    })).toEqual({
      state: 'MODIFIED_LOCALLY',
      modifications: {a: 1},
      nonConflictingModifications: {a: 1},
      changes: objectChange<any>(
        {},
        {},
        {
          b: removedKey(),
        }
      ),
    })
  })

  test('conflicting locally removed key in object', () => {
    expect(merge({
      original: {a: 1, b: 2},
      server: {a: 1, b: 3},
      local: {a: 1},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1},
      nonConflictingModifications: {a: 1, b: 3},
      changes: objectChange<any>(
        {},
        {},
        {
          b: removedOnLocalWithServerModification(3),
        }
      ),
    })
  })

  test('conflicting remotely removed key in object', () => {
    expect(merge({
      original: {a: 1, b: 2},
      server: {a: 1},
      local: {a: 1, b: 3},
    })).toEqual({
      state: 'CONFLICT',
      modifications: {a: 1, b: 3},
      nonConflictingModifications: {a: 1},
      changes: objectChange<any>(
        {},
        {},
        {
          b: removedOnServerWithLocalModification(3),
        }
      ),
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
      changes: objectChange({
        value: scalarChange(2),
      })
    })
  })
})
