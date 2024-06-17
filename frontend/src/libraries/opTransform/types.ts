export type Operation = Composite | ObjectOp | NoOp | ListOp | Replace | StringModification
export type ObjectOp = Apply
export type ListOp = ListApply | Add | Remove | Move

export type Value = null | string | number | boolean | JSONObject | Array<Value>;
export interface JSONObject {
  [x: string]: Value
}

export type OperationType = Operation['type']

export type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object'

/* Escape hatch to set inspecting formatter to ease testing */
let opExtra = {}
export const setOpExtra = (extra) => { opExtra = extra }

/* Composition ops */

// A list of operations meant to be taken as an atomic step
export interface Composite {
  type: 'Composite'
  ops: Operation[] //Always at least two ops, and never constains NoOp
}

export function composite(unfilteredOps: Operation[]): Operation {
  const ops = unfilteredOps.filter(o => o.type !== 'NoOp')
  if (ops.length === 0) return NO_OP
  if (ops.length === 1) return ops[0]

  return op('Composite', {ops})
}

export interface Apply {
  type: 'Apply'
  ops: Record<string, Operation>
}
export function apply(ops: Record<string, Operation>): Operation {
  const entries = Array.from(Object.entries(ops)).filter(([_, op]) => !isNoOp(op))
  if (entries.length === 0) return NO_OP

  return op('Apply', {ops: Object.fromEntries(entries)})
}

export interface ListApply {
  type: 'ListApply'
  ops: Map<number, Operation>
}
type IndexOperation = [number, Operation]

export function listApply(ops: Map<number, Operation>): Operation
export function listApply(...ops: IndexOperation[]): Operation
export function listApply(ops: Map<number, Operation> | IndexOperation, ...additionalOps: IndexOperation[]): Operation {
  const entries = Array.isArray(ops) ? [ops, ...additionalOps] : Array.from(ops.entries())
  const filteredEntries = entries.filter(([_, op]) => !isNoOp(op))
  const filteredOps = new Map(filteredEntries)
  if (filteredOps.size === 0) return NO_OP
  if (filteredEntries.length !== filteredOps.size) throw new Error('Duplicate ops detected')

  return op('ListApply', {ops: filteredOps})
}

export interface NoOp {
  type: 'NoOp'
}

export const NO_OP: NoOp = {type: 'NoOp'}

/* List Ops */

export interface Add {
  type: 'Add'
  beforeIndex: number
  values: Value[]
}

export function add(beforeIndex: number, values: Value[]): Operation {
  if (values.length === 0) return NO_OP

  return op('Add', {beforeIndex, values})
}

export interface Remove {
  type: 'Remove'
  index: number
  values: Value[]
}

export function remove(index: number, values: Value[]): Operation {
  if (values.length === 0) return NO_OP

  return op('Remove', {index, values})
}

export interface Move {
  type: 'Move'
  from: number
  to: number
  length: number //Default is 1
}

export function move(from: number, to: number, length: number = 1): Operation {
  if (length === 0 || from === to) return NO_OP

  return op('Move', {from, to, length})
}

/* Replace OP */

export interface Replace {
  type: 'Replace'
  from: Value
  to: Value
}

export function replace(from: Value, to: Value): Operation {
  if (from === to) return NO_OP
  return op('Replace', {from, to})
}

//Generic string operation that can either add or remove or replace text
export interface StringModification {
  type: 'StringModification'
  index: number
  remove: string
  add: string
}

export function stringModification({index, remove = '', add = ''}: {index: number, remove?: string, add?: string}): Operation {
  //Modifications are empty or they add and delete the same string
  if (remove === add) return NO_OP

  return op('StringModification', {index, remove, add})
}

function op<T extends Exclude<Operation, NoOp>>(type: T['type'], op: Omit<T, 'type'>): T{
  return { type, ...op, ...opExtra } as unknown as T
}


/** Type checks */

export function isStructuralOp(op: Operation): op is ListOp | ObjectOp {
  return op.type === 'Apply' || isListOp(op)
}
export function isListOp(op: Operation): op is ListOp {
  switch (op.type) {
    case 'ListApply':
    case 'Add':
    case 'Remove':
    case 'Move':
      return true
  }
  return false
}


export function isScalarOp(op: Operation): op is StringModification {
  return op.type === 'StringModification'
}

export function isNoOp(op: Operation): op is NoOp{
  return op.type === 'NoOp'
}
