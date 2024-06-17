import { Value } from './types'

export function ensureProperIndexes(listOrMaxLen: unknown[] | string | number, ...indexes: number[]): void {
  const len = typeof listOrMaxLen === 'number' ? listOrMaxLen : listOrMaxLen.length
  const outOfBounds = indexes.find(i => i < 0 || i >= len)
  if (outOfBounds !== undefined) {
    throw new Error(`Index out of bounds ${outOfBounds}. Array/string length is ${len}`)
  }
}

export function ensureArray(value: Value, callback: (value: Array<Value>) => Value): Value {
  if (!Array.isArray(value)) throw new Error('Value is not an array')

  return callback(value)
}

export function ensureString(value: Value, callback: (value: string) => Value): Value {
  if (typeof value !== 'string') throw new Error('Value is not a string')

  return callback(value)
}

export function strSplice(str: string, {index, remove, add}: {index: number, remove: string, add: string}) {
  return str.slice(0, index) + add + str.slice(index + remove.length)
}
