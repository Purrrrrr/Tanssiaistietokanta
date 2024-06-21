import deepEquals from 'fast-deep-equal'

export type Operation = Composite | ObjectOp | NoOp | ListOp | Replace | StringModification | OpError
export type ObjectOp = Apply
export type ListOp = ListApply | ListSplice | Move

export type Value = null | string | number | boolean | JSONObject | Array<Value>;
export interface JSONObject {
  [x: string]: Value
}

export type OperationType = Operation['type']

export type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object'

/* Escape hatch to set inspecting formatter to ease testing */
let opExtra = {}
export const setOpExtra = (extra) => { opExtra = extra }

export interface OpError {
  type: 'OpError'
}
export const opError = (msg?: string) => op('OpError', {})


/* Composition ops */

// A list of operations meant to be taken as an atomic step
export interface Composite {
  type: 'Composite'
  ops: Operation[] //Always at least two ops, and never constains NoOp
}

export function composite(unfilteredOps: Operation[]): Operation {
  if (unfilteredOps.some(isOpError)) return opError()
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
  if (Object.values(ops).some(isOpError)) return opError()
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

/* Splices for lists and strings */

export interface ListSplice extends Splice<Value[]>{
  type: 'ListSplice'
}

export interface Splice<T> {
  index: number
  remove: T
  add: T
}
export function listSplice(index: number, {remove = [], add = []}: {remove?: Value[], add?: Value[]}): ListSplice | NoOp {
  //Modifications are empty or they add and delete the same string
  if (deepEquals(remove, add)) return NO_OP

  return op('ListSplice', {index, remove, add}) as ListSplice
}

//Generic string operation that can either add or remove or replace text
export interface StringModification extends Splice<string> {
  type: 'StringModification'
}

export function stringAdd(index: number, add: ''): NoOp
export function stringAdd(index: number, add: string): StringModification
export function stringAdd(index: number, add: string): Operation {
  return stringModification(index, {add})
}
export function stringDel(index: number, remove: ''): NoOp
export function stringDel(index: number, remove: string): StringModification
export function stringDel(index: number, remove: string): Operation {
  return stringModification(index, {remove})
}

export function stringModification(index: number, {remove = '', add = ''}: {remove?: string, add?: string}): StringModification | NoOp {
  //Modifications are empty or they add and delete the same string
  if (remove === add) return NO_OP

  return op<StringModification>('StringModification', {index, remove, add})
}

/* List Ops */

export function add(beforeIndex: number, values: Value[]): ListSplice | NoOp {
  if (values.length === 0) return NO_OP

  return op<ListSplice>('ListSplice', {index: beforeIndex, add: values, remove: []})
}

export function remove(index: number, values: Value[]): ListSplice | NoOp {
  if (values.length === 0) return NO_OP

  return op<ListSplice>('ListSplice', {index, remove: values, add: []})
}

export interface Move {
  type: 'Move'
  from: number
  to: number
  length: 1 //Maybe support larger moves later
}

export function move(from: number, to: number, length: number = 1): Operation {
  if (length <= 0 || from === to) return NO_OP

  return op('Move', {from, to, length})
}

/* Replace OP */

export interface Replace {
  type: 'Replace'
  from: Value
  to: Value
}

export function replace(from: Value, to: Value): Operation {
  if (deepEquals(from, to)) return NO_OP

  return op('Replace', {from, to})
}

function op<T extends Exclude<Operation, NoOp>>(type: T['type'], op: Omit<T, 'type'>): T{
  return { type, ...op, ...opExtra } as unknown as T
}


/** Type checks */

export function isStructuralOp(op: Operation): op is ListOp | ObjectOp {
  return op.type === 'Apply' || isListOp(op)
}
export function isObjectOp(op: Operation): op is ObjectOp {
  return op.type === 'Apply'
}
export function isListOp(op: Operation): op is ListOp {
  switch (op.type) {
    case 'ListApply':
    case 'ListSplice':
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

export function isOpError(op: Operation): op is OpError{
  return op.type === 'OpError'
}
