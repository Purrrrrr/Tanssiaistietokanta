export type Value = null | string | number | boolean | JSONObject | Array<Value>;
export interface JSONObject {
  [x: string]: Value
}

export type Operation = Composite | ObjectOp | NoOp | ListOp | Replace | StringModification | OpError

export interface Splice<T> {
  index: number
  remove: T
  add: T
}

type OpType = Operation['type']
export const opTypes = {
  Composite: 'Composite',
  ApplyProps: 'ApplyProps',
  NoOp: 'NoOp',
  ApplyIndexes: 'ApplyIndexes',
  ListSplice: 'ListSplice',
  Move: 'Move',
  Replace: 'Replace',
  StringModification: 'StringModification',
  OpError: 'OpError',
} as const satisfies Record<OpType, OpType>

/*------------------*/
/*   Generic ops    */
/*------------------*/

export interface NoOp {
  type: 'NoOp'
}
export interface OpError {
  type: 'OpError'
  msg?: string
}
// A list of operations meant to be taken as an atomic step
export interface Composite {
  type: 'Composite'
  ops: Operation[] //Always at least two ops, and never constains NoOp
}
export interface Replace {
  type: 'Replace'
  from: Value
  to: Value
}

/*------------------*/
/*    Object ops    */
/*------------------*/

export type ObjectOp = ApplyProps
export interface ApplyProps {
  type: 'ApplyProps'
  ops: Record<string, Operation>
}

/*------------------*/
/*     List ops    */
/*------------------*/

export type ListOp = ApplyIndexes | ListSplice | Move

export interface ApplyIndexes {
  type: 'ApplyIndexes'
  ops: Map<number, Operation>
}
export interface ListSplice extends Splice<Value[]>{
  type: 'ListSplice'
}
export interface Move {
  type: 'Move'
  from: number
  to: number
  length: 1 //Maybe support larger moves later
}

/*------------------*/
/*    Scalar ops    */
/*------------------*/

export type ScalarOp = StringModification

//Generic string operation that can either add or remove or replace text
export interface StringModification extends Splice<string> {
  type: 'StringModification'
}

/*-------------------*/
/*    Type checks    */
/*-------------------*/


export function isStructuralOp(op: Operation): op is ListOp | ObjectOp {
  return op.type === opTypes.ApplyProps || isListOp(op)
}
export function isObjectOp(op: Operation): op is ObjectOp {
  return op.type === opTypes.ApplyProps
}
export function isListOp(op: Operation): op is ListOp {
  switch (op.type) {
    case opTypes.ApplyIndexes:
    case opTypes.ListSplice:
    case opTypes.Move:
      return true
  }
  return false
}

export function isStringOp(op: Operation): op is StringModification {
  return op.type === opTypes.StringModification
}

export function isScalarOp(op: Operation): op is ScalarOp {
  return op.type === opTypes.StringModification
}

export function isNoOp(op: Operation): op is NoOp{
  return op.type === opTypes.NoOp
}

export function isOpError(op: Operation): op is OpError{
  return op.type === opTypes.OpError
}
