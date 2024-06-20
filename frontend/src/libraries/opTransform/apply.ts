import deepEquals from 'fast-deep-equal'

import { Operation, Value } from './types'

import { ensureArray, ensureEquality, ensureProperIndexes, ensureString, splice } from './utils'

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
    case 'Move':
      return ensureArray(value, list => {
        const {to, from, length} = op
        ensureProperIndexes(list, from, from + length - 1, to, to + length - 1)
        return list.toSpliced(from, length).toSpliced(to, 0, ...list.slice(from, from + length))
      })
    case 'Replace':
      ensureEquality(op.from, value ?? null)

      return op.to
    case 'ListSplice':
      return ensureArray(value, list => {
        const {remove, index} = op
        if (!deepEquals(list.slice(index, index+remove.length), remove)) throw new Error('List removal mismatch')

        return splice(list, op)
      })
    case 'StringModification':
      return ensureString(value, str => {
        const {remove, index} = op
        if (str.slice(index, index+remove.length) !== remove) throw new Error('String removal mismatch')

        return splice(str, op)
      })
  }
}
