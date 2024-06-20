import {
  Apply,
  Composite,
  composite,
  isObjectOp,
  isScalarOp,
  isStructuralOp,
  ListApply,
  ListSplice,
  listSplice,
  Move,
  NO_OP,
  NoOp,
  Operation,
  Replace,
  replace,
  StringModification,
  stringModification,
} from './types'

import { apply } from './apply'
import { indexAfterSpliceOp, rebaseSpliceOps } from './spliceOps'

export function rebaseOnto(base: Operation, op: Operation): Operation {
  if (op.type === 'NoOp') {
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
  switch (base.type) {
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
      return NO_OP //rebaseOntoStringModification(base, op)
    case 'StringModification':
      return rebaseOntoStringModification(base, op)
  }
}

type OperationToRebase = Exclude<Operation, NoOp | Composite>

function rebaseOntoApply(base: Apply, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoListApply(base: ListApply, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoMove(base: Move, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoReplace(base: Replace, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoListSplice(base: ListSplice, op: OperationToRebase): Operation {
  if (isScalarOp(op) || isObjectOp(op)) {
    //Type mismatch: the other op would have failed
    return NO_OP
  }
  switch (op.type) {
    case 'ListApply':
      return NO_OP //TODO
    case 'Move':
      return NO_OP //TODO
  }
  if (op.type === 'Replace') {
    return replace(apply(base, op.from), op.to)
  }

  const mods = rebaseSpliceOps(base, op, [])
  return listSplice(mods.index ?? op.index, { add: op.add, remove: mods.remove ?? op.remove })
}

function rebaseOntoStringModification(base: StringModification, op: OperationToRebase): Operation {
  if (isStructuralOp(op)) {
    //Type mismatch: the other op would have failed
    return NO_OP
  }
  if (op.type === 'Replace') {
    return replace(apply(base, op.from), op.to)
  }

  const mods = rebaseSpliceOps(base, op, '')
  return stringModification(mods.index ?? op.index, { add: op.add, remove: mods.remove ?? op.remove })
}
