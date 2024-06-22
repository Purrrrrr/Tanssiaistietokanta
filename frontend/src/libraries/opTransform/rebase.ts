import {
  isListOp,
  isObjectOp,
  isScalarOp,
  isStringOp,
  isStructuralOp,
  opTypes,
} from './types'

import { apply } from './apply'
import {
  apply as applyOp,
  composite,
  listApply,
  listSplice,
  move,
  NO_OP,
  opError,
  replace,
  stringAdd,
  stringModification,
} from './ops'
import { elementIndexAfterSpliceOp, indexAfterSpliceOp, rebaseSpliceOps } from './spliceOps'
import type {
  Apply,
  Composite,
  ListApply,
  ListOp,
  ListSplice,
  Move,
  NoOp,
  Operation,
  OpError,
  Replace,
  StringModification,
} from './types'

export function rebaseOnto(base: Operation, op: Operation): Operation {
  if (op.type === opTypes.NoOp || op.type === opTypes.OpError) {
    return op
  }
  if (base.type === opTypes.Composite) {
    return base.ops.reduce((newOp, baseOp) => rebaseOnto(baseOp, newOp), op)
  }
  if (op.type === opTypes.Composite) {
    const [first, ...rest] = op.ops
    const rebasedFirst = rebaseOnto(base, first)
    const rebasedOnto = rebaseOnto(first, base)
    const rebasedRest = rebaseOnto(rebasedOnto, composite(rest))

    switch (rebasedRest.type) {
      case opTypes.NoOp: return rebasedFirst
      case opTypes.Composite: return composite([rebasedFirst, ...rebasedRest.ops])
      default: return composite([rebasedFirst, rebasedRest])
    }
  }
  if (op.type === opTypes.Replace) {
    return replace(apply(base, op.from), op.to)
  }
  switch (base.type) {
    case opTypes.OpError:
      return opError('Operation happens after error')
    case opTypes.Apply:
      return rebaseOntoApply(base, op)
    case opTypes.ListApply:
      return rebaseOntoListApply(base, op)
    case opTypes.NoOp:
      return op
    case opTypes.Move:
      return rebaseOntoMove(base, op)
    case opTypes.Replace:
      return rebaseOntoReplace(base, op)
    case opTypes.ListSplice:
      return rebaseOntoListSplice(base, op)
    case opTypes.StringModification:
      return rebaseOntoStringModification(base, op)
  }
}

type OperationToRebase = Exclude<Operation, NoOp | Composite | Replace | OpError>

function rebaseOntoApply(base: Apply, op: OperationToRebase): Operation {
  if (isScalarOp(op) || isListOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }
  // op is Apply
  const ops = Object.fromEntries(
    Object.entries(op.ops)
      .map(([key, subOp]) => {
        const newOp = key in base.ops
          ? rebaseOnto(base.ops[key], subOp)
          : subOp
        return [key, newOp]
      })
  )
  return applyOp(ops)
}

function rebaseOntoListApply(base: ListApply, op: OperationToRebase): Operation {
  if (isScalarOp(op) || isObjectOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }

  switch (op.type) {
    case opTypes.Move:
      return op
    case opTypes.ListApply: {
      const ops = new Map(op.ops)
      Array.from(op.ops.entries())
        .forEach(([index, subOp]) => {
          const baseOp = base.ops.get(index)
          if (baseOp) {
            const newOp = rebaseOnto(baseOp, subOp)
            ops.set(index, newOp)
          }
        })
      return listApply(ops)
    }
    case opTypes.ListSplice: {
      const { remove, add, index } = op
      if (remove.length === 0) return op

      const newRemove = remove.map((val, remIndex) => {
        const baseOp = base.ops.get(index + remIndex)
        return baseOp ? apply(baseOp, val) : val
      })
      return listSplice(index, {add, remove: newRemove})
    }
  }
}

function rebaseOntoMove(base: Move, op: OperationToRebase): Operation {
  if (isScalarOp(op) || isObjectOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }
  switch (op.type) {
    case opTypes.Move:
      return NO_OP
    case opTypes.ListApply: {
      return NO_OP
    }
    case opTypes.ListSplice: {
      return NO_OP
    }
  }
}

function rebaseOntoReplace(base: Replace, op: OperationToRebase): Operation {
  const { to } = base
  if (Array.isArray(to)) {
    if (!isListOp(op)) {
      return opError('Type mismatch')
    }
    const remove = Array.isArray(base.from) ? base.from : new Array(maxIndex(op) + 1)

    return rebaseOnto(listSplice(0, {remove, add: to}), op)
  } else if (typeof to === 'object' && to !== null) {
    if (!isObjectOp(op)) {
      return opError('Type mismatch')
    }
    const from = base.from ?? {}
    const baseOps = Object.fromEntries(
      Object.keys(op.ops).map(key => ([key, replace(from[key], to[key])]))
    )
    return rebaseOnto(applyOp(baseOps), op)
  } else if (typeof to === 'string'){
    if (!isStringOp(op)) {
      return opError('Type mismatch')
    }

    return stringAdd(to.length, op.add)
  }
  //We have no ops for numbers, booleans or nulls yet (except for replace, that is handled elsewhere)
  return opError('Type mismatch')
}

function maxIndex(op: ListOp): number {
  switch (op.type) {
    case opTypes.ListApply:
      return Math.max(...op.ops.keys())
    case opTypes.ListSplice:
      return op.index + op.remove.length
    case opTypes.Move:
      return Math.max(op.from, op.to) + op.length
  }
}

function rebaseOntoListSplice(base: ListSplice, op: OperationToRebase): Operation {
  if (!isListOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }
  switch (op.type) {
    case opTypes.ListApply: {
      const ops = new Map<number, Operation>()
      Array.from(op.ops.entries())
        .forEach(([index, op]) => {
          const newIndex = elementIndexAfterSpliceOp(index, base)
          if (newIndex !== null) {
            ops.set(newIndex, op)
          }
        })
      return listApply(ops)
    }
    case opTypes.Move: {
      const from = elementIndexAfterSpliceOp(op.from, base)
      if (!from) return NO_OP
      const to = indexAfterSpliceOp(op.from, base)

      //TODO: larger move support
      if (op.length !== 1) throw new Error('should not happen')

      return move(from, to)
    }
  }

  const mods = rebaseSpliceOps(base, op, [])
  return listSplice(mods.index ?? op.index, { add: op.add, remove: mods.remove ?? op.remove })
}

function rebaseOntoStringModification(base: StringModification, op: OperationToRebase): Operation {
  if (isStructuralOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }

  const mods = rebaseSpliceOps(base, op, '')
  return stringModification(mods.index ?? op.index, { add: op.add, remove: mods.remove ?? op.remove })
}
