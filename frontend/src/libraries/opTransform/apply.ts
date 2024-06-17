import deepEquals from 'fast-deep-equal'

import { Operation, Value } from './types'

import { ensureArray, ensureProperIndexes, ensureString, strSplice } from './utils'

export function apply(op: Operation, value: Value): Value {
  switch (op.type) {
    case 'Composite':
      return op.ops.reduce((val, subOp) => apply(subOp, val), value)
    case 'Apply': {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Value is not an object')
      }
      const newObj = { ...value }
      for (const [key, keyOp] of Object.entries(op.ops)) {
        newObj[key] = apply(keyOp, value[key])
      }
      return newObj
    }
    case 'ListApply':
      return ensureArray(value, list => {
        return list.map((val, index) => {
          const subOp = op.ops.get(index)
          return subOp ? apply(subOp, val) : val
        })
      })
    case 'NoOp':
      return value
    case 'Add':
      return ensureArray(value, list => {
        ensureProperIndexes(list.length + 1, op.beforeIndex)
        return list.toSpliced(op.beforeIndex, 0, ...op.values)
      })
    case 'Remove':
      return ensureArray(value, list => {
        ensureProperIndexes(list, op.index, op.index + op.values.length - 1)
        //Todo: check that removed values match
        return list.toSpliced(op.index, op.values.length)
      })
    case 'Move':
      return ensureArray(value, list => {
        const {to, from, length} = op
        ensureProperIndexes(list, from, from + length - 1, to, to + length - 1)
        return list.toSpliced(from, length).toSpliced(to, 0, ...list.slice(from, from + length))
      })
    case 'Replace':
      if (!deepEquals(op.from, value)) throw new Error('Document mismatch')

      return op.to
    case 'StringModification':
      return ensureString(value, str => {
        const {remove, index} = op
        if (str.slice(index, index+remove.length) !== remove) throw new Error('String removal mismatch')

        return strSplice(str, op)
      })
  }
}
