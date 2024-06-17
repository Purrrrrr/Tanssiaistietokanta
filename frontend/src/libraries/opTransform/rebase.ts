import {
  Add,
  Apply,
  Composite,
  composite,
  isStructuralOp,
  ListApply,
  Move,
  NO_OP,
  NoOp,
  Operation,
  Remove,
  Replace,
  replace,
  StringModification,
  stringModification,
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
    case 'Add':
      return rebaseOntoAdd(base, op)
    case 'Remove':
      return rebaseOntoRemove(base, op)
    case 'Move':
      return rebaseOntoMove(base, op)
    case 'Replace':
      return rebaseOntoReplace(base, op)
    case 'ListSplice':
      return rebaseOntoStringModification(base, op)
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

function rebaseOntoAdd(base: Add, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoRemove(base: Remove, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoMove(base: Move, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoReplace(base: Replace, op: OperationToRebase): Operation {
  return NO_OP
}

function rebaseOntoStringModification(base: StringModification, op: OperationToRebase): Operation {
  if (isStructuralOp(op)) {
    //Type mismatch: the other op would have failed
    return NO_OP
  }
  if (op.type === 'Replace') {
    return replace(apply(base, op.from), op.to)
  }

  return rebaseSliceOps(base, op)
}

function rebaseSliceOps(base: StringModification, op: StringModification): StringModification | NoOp {
  const baseDeletes = base.remove.length
  const baseInserts = base.add.length
  const baseIndex = base.index
  const baseEnd = base.index + base.remove.length

  const { index, add, remove } = op
  const end = index + remove.length

  if (end <= baseIndex) {
    //    BASE
    // OP
    return op
  }
  if (baseEnd <= index) {
    // BASE
    //      OP
    return stringModification(
      index + baseInserts - baseDeletes,
      { add, remove }
    )
  }
  // The edits overlap somehow: index < baseEnd && baseIndex < end
  // This means that at least one of them has a delete, since inserts cannot overlap

  if (baseDeletes) {
    if (end <= baseEnd) {
      if (index > baseIndex) {
        // -BASE-
        //   OP
        //Everything op does happens in a deleted slice
        return NO_OP
      }

      //   -BASE-
      // -OP--
      return stringModification(index, {add, remove: remove.slice(0, index - baseIndex)})
    }
    // baseEnd < end
    if (index < baseIndex) {
      //   BASE
      // ---OP---
      //op completely deletes the text that base had modified:
      const baseIndexInsideOp = baseIndex - index
      console.log({index, baseIndex, baseIndexInsideOp, remove: base.remove, add: base.add})
      return stringModification(
        index,
        {
          add,
          remove: splice(remove, {index: baseIndexInsideOp, remove: base.remove, add: base.add})
        }
      )
    }

    // baseIndex <= index && baseEnd < end && index <= end && index > baseEnd
    // ----BASE
    //    OP------
    return stringModification(
      baseIndex + baseInserts,
      {
        add: add.slice(baseIndex - index),
        remove: remove.slice(baseIndex - index)
      }
    )
  }

  //Base only inserts text and op deletes (and maybe inserts) some: baseIndex == baseEnd && index < baseIndex < end
  //Base is fully inside op. Just enlarge op
  const baseIndexInsideOp = baseIndex - index
  return stringModification(
    index,
    {
      add,
      remove: splice(remove, {index: baseIndexInsideOp, remove: '', add: base.add})
    },
  )
}
