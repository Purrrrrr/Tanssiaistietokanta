import deepEquals from 'fast-deep-equal'

import { Value } from './types'

export function ensureProperIndexes(listOrMaxLen: unknown[] | string | number, ...indexes: number[]): void {
  const len = typeof listOrMaxLen === 'number' ? listOrMaxLen : listOrMaxLen.length
  const outOfBounds = indexes.find(i => i < 0 || i >= len)
  if (outOfBounds !== undefined) {
    throw new Error(`Index out of bounds ${outOfBounds}. Array/string length is ${len}`)
  }
}

export function ensureEquality(a: Value, b: Value): void  {
  if (!deepEquals(a, b)) throw new Error('Document mismatch ')
}

export function ensureArray(value: Value, callback: (value: Array<Value>) => Value): Value {
  if (!Array.isArray(value)) throw new Error('Value is not an array')

  return callback(value)
}

export function ensureString(value: Value, callback: (value: string) => Value): Value {
  if (typeof value !== 'string') throw new Error('Value is not a string')

  return callback(value)
}

export function splice(val: string, {index, remove, add}: {index: number, remove: string, add: string}): string
export function splice(val: Value[], {index, remove, add}: {index: number, remove: Value[], add: Value[]}): Value[]
export function splice<T extends string | Value[]>(val: T, {index, remove, add}: {index: number, remove: T, add: T}): string | Value[] {
  ensureProperIndexes(val, index)
  if (remove) ensureProperIndexes(val, index + remove.length - 1)

  if (typeof val === 'string') {
    return val.slice(0, index) + add + val.slice(index + remove.length)
  }
  return val.toSpliced(index, remove.length, ...add)
}
