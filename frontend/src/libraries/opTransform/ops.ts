import deepEquals from 'fast-deep-equal'

import {
  isNoOp,
  isOpError,
  opTypes,
} from './types'

import type {
  ListSplice,
  NoOp,
  Operation,
  StringModification,
  Value,
} from './types'

/*------------------*/
/*   Generic ops    */
/*------------------*/

export const NO_OP: NoOp = {type: opTypes.NoOp}

export const opError = (msg?: string) => op(opTypes.OpError, {msg})

export function composite(unfilteredOps: Operation[]): Operation {
  if (unfilteredOps.some(isOpError)) return opError()
  const ops = unfilteredOps.filter(o => o.type !== opTypes.NoOp)
  if (ops.length === 0) return NO_OP
  if (ops.length === 1) return ops[0]

  return op(opTypes.Composite, {ops})
}

export function replace(from: Value, to: Value): Operation {
  if (deepEquals(from, to)) return NO_OP

  return op(opTypes.Replace, {from, to})
}

/*------------------*/
/*    Object ops    */
/*------------------*/


export function applyProps(ops: Record<string, Operation>): Operation {
  if (Object.values(ops).some(isOpError)) return opError()
  const entries = Array.from(Object.entries(ops)).filter(([_, op]) => !isNoOp(op))
  if (entries.length === 0) return NO_OP

  return op(opTypes.ApplyProps, {ops: Object.fromEntries(entries)})
}

/*------------------*/
/*     List ops    */
/*------------------*/

type IndexOperation = [number, Operation]

export function applyIndexes(ops: Map<number, Operation>): Operation
export function applyIndexes(...ops: IndexOperation[]): Operation
export function applyIndexes(ops: Map<number, Operation> | IndexOperation, ...additionalOps: IndexOperation[]): Operation {
  const entries = Array.isArray(ops) ? [ops, ...additionalOps] : Array.from(ops.entries())
  const filteredEntries = entries.filter(([_, op]) => !isNoOp(op))
  const filteredOps = new Map(filteredEntries)
  if (filteredOps.size === 0) return NO_OP
  if (filteredEntries.length !== filteredOps.size) throw new Error('Duplicate ops detected')

  return op(opTypes.ApplyIndexes, {ops: filteredOps})
}

export function listSplice(index: number, {remove = [], add = []}: {remove?: Value[], add?: Value[]}): ListSplice | NoOp {
  //Modifications are empty or they add and delete the same string
  if (deepEquals(remove, add)) return NO_OP

  return op(opTypes.ListSplice, {index, remove, add}) as ListSplice
}

export function move(from: number, to: number, length: number = 1): Operation {
  if (length <= 0 || from === to) return NO_OP

  return op(opTypes.Move, {from, to, length})
}


/* List Ops */

export function add(beforeIndex: number, values: Value[]): ListSplice | NoOp {
  if (values.length === 0) return NO_OP

  return op<ListSplice>(opTypes.ListSplice, {index: beforeIndex, add: values, remove: []})
}

export function remove(index: number, values: Value[]): ListSplice | NoOp {
  if (values.length === 0) return NO_OP

  return op<ListSplice>(opTypes.ListSplice, {index, remove: values, add: []})
}

/*------------------*/
/*    String ops    */
/*------------------*/

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

  return op<StringModification>(opTypes.StringModification, {index, remove, add})
}

/*-------------------*/
/* Utility functions */
/*-------------------*/

let opExtra = {}
export const setOpExtra = (extra: object) => { opExtra = extra }

function op<T extends Exclude<Operation, NoOp>>(type: T['type'], op: Omit<T, 'type'>): T{
  return { type, ...op, ...opExtra } as unknown as T
}

export const listOps = {
  apply: applyIndexes,
  insert: add,
  remove,
  move,
  splice: listSplice,
}

export const stringOps = {
  insert: stringAdd,
  remove: stringDel,
  splice: stringModification,
}
export const Op = {
  NO_OP,
  error: opError,
  composite,
  replace,
  applyProps,
  list: listOps,
  string: stringOps,
}

export default Op
