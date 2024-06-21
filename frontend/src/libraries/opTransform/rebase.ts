import {
  Apply,
  apply as applyOp,
  Composite,
  composite,
  isListOp,
  isObjectOp,
  isScalarOp,
  isStructuralOp,
  ListApply,
  listApply,
  ListSplice,
  listSplice,
  Move,
  move,
  NO_OP,
  NoOp,
  Operation,
  OpError,
  opError,
  Replace,
  replace,
  StringModification,
  stringModification,
} from './types'

import { apply } from './apply'
import { elementIndexAfterSpliceOp, indexAfterSpliceOp, rebaseSpliceOps } from './spliceOps'

export function rebaseOnto(base: Operation, op: Operation): Operation {
  if (op.type === 'NoOp' || op.type === 'OpError') {
    return op
  }
  if (base.type === 'Composite') {
    return base.ops.reduce((newOp, baseOp) => rebaseOnto(baseOp, newOp), op)
  }
  if (op.type === 'Composite') {
    const [first, ...rest] = op.ops
    const rebasedFirst = rebaseOnto(base, first)
    const rebasedOnto = rebaseOnto(first, base)
    const rebasedRest = rebaseOnto(rebasedOnto, composite(rest))

    switch (rebasedRest.type) {
      case 'NoOp': return rebasedFirst
      case 'Composite': return composite([rebasedFirst, ...rebasedRest.ops])
      default: return composite([rebasedFirst, rebasedRest])
    }
  }
  if (op.type === 'Replace') {
    return replace(apply(base, op.from), op.to)
  }
  switch (base.type) {
    case 'OpError':
      return opError('Operation happens after error')
    case 'Apply':
      return rebaseOntoApply(base, op)
    case 'ListApply':
      return rebaseOntoListApply(base, op)
    case 'NoOp':
      return op
    case 'Move':
      return rebaseOntoMove(base, op)
    case 'Replace':
      return rebaseOntoReplace(base, op)
    case 'ListSplice':
      return rebaseOntoListSplice(base, op)
    case 'StringModification':
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
    case 'Move':
      return op
    case 'ListApply': {
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
    case 'ListSplice': {
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
    case 'Move':
      return NO_OP
    case 'ListApply': {
      return NO_OP
    }
    case 'ListSplice': {
      return NO_OP
    }
  }
}

function rebaseOntoReplace(base: Replace, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoListSplice(base: ListSplice, op: OperationToRebase): Operation {
  if (isScalarOp(op) || isObjectOp(op)) {
    //Type mismatch: the other op would have failed
    return opError('Type mismatch')
  }
  switch (op.type) {
    case 'ListApply': {
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
    case 'Move': {
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
