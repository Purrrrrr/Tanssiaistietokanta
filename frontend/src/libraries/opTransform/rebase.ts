import deepEquals from 'fast-deep-equal'

import {
  Apply,
  Composite,
  composite,
  isObjectOp,
  isScalarOp,
  isStructuralOp,
  ListApply,
  listSplice,
  ListSplice,
  Move,
  NO_OP,
  NoOp,
  Operation,
  Replace,
  replace,
  Splice,
  StringModification,
  stringModification,
  Value,
} from './types'

import { apply } from './apply'
import { splice } from './utils'

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

  const mods = rebaseSliceOps(base, op, [])
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

  const mods = rebaseSliceOps(base, op, '')
  return stringModification(mods.index ?? op.index, { add: op.add, remove: mods.remove ?? op.remove })
}

function rebaseSliceOps<T extends string | Value[]>(base: Splice<T>, op: Splice<T>, emptyVal: T): SpliceOpChange<T> {
  const baseDeletes = base.remove.length
  const baseInserts = base.add.length
  const baseIndex = base.index
  const baseEnd = base.index + base.remove.length

  const { index, remove } = op
  const end = index + remove.length

  if (end <= baseIndex) {
    //    BASE
    // OP
    return {}
  }
  if (baseEnd <= index) {
    // BASE
    //      OP
    return { index: index + baseInserts - baseDeletes }
  }
  // The edits overlap somehow: index < baseEnd && baseIndex < end
  // This means that at least one of them has a delete, since inserts cannot overlap

  if (baseDeletes) {
    if (end <= baseEnd) {
      if (index > baseIndex) {
        // -BASE-
        //   OP
        //Everything op does happens in a deleted slice
        return {index: baseIndex + baseInserts, remove: emptyVal}
      }

      //   -BASE-
      // -OP--
      return { remove: remove.slice(0, index - baseIndex) as T }
    }
    // baseEnd < end
    if (index < baseIndex) {
      //   BASE
      // ---OP---
      //op completely deletes the text that base had modified:
      const baseIndexInsideOp = baseIndex - index
      return {
        remove: splice(remove, {index: baseIndexInsideOp, remove: base.remove, add: base.add}) as T
      }
    }

    // baseIndex <= index && baseEnd < end && index <= end && index > baseEnd
    // ----BASE
    //    OP------
    return {
      index: baseIndex + baseInserts,
      remove: remove.slice(baseIndex - index) as T
    }
  }

  //Base only inserts text and op deletes (and maybe inserts) some: baseIndex == baseEnd && index < baseIndex < end
  //Base is fully inside op. Just enlarge op
  const baseIndexInsideOp = baseIndex - index
  return {
    remove: splice(remove, {index: baseIndexInsideOp, remove: emptyVal, add: base.add}) as T
  }
}

interface SpliceOpChange<T> {
  index?: number
  remove?: T
}
