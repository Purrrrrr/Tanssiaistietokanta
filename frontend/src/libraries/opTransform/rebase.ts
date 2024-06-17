import {
  Add,
  Apply,
  Composite,
  composite,
  isListOp,
  isStructuralOp,
  ListApply,
  Move,
  NO_OP,
  NoOp,
  Operation,
  Remove,
  Replace,
  stringModification,
  StringModification,
} from './types'
import { strSplice } from './utils'

export function rebase({op, base}: {op: Operation, base: Operation}): Operation {
  if (op.type === 'NoOp') {
    return op
  }
  if (base.type === 'Composite') {
    return base.ops.reduce((newOp, baseOp) => rebase({op: newOp, base: baseOp}), op)
  }
  if (op.type === 'Composite') {
    const [first, ...rest] = op.ops
    const rebasedFirst = rebase({base, op: first})
    const rebasedOnto = rebase({base: first, op: base})
    const rebasedRest = rebase({base: rebasedOnto, op: composite(rest)})

    switch (rebasedRest.type) {
      case 'NoOp': return rebasedFirst
      case 'Composite': return composite([rebasedFirst, ...rebasedRest.ops])
      default: return composite([rebasedFirst, rebasedRest])
    }
  }
  switch (base.type) {
    case 'Apply':
      return rebaseOntoApply({op, base})
    case 'ListApply':
      return rebaseOntoListApply({op, base})
    case 'NoOp':
      return op
    case 'Add':
      return rebaseOntoAdd({op, base})
    case 'Remove':
      return rebaseOntoRemove({op, base})
    case 'Move':
      return rebaseOntoMove({op, base})
    case 'Replace':
      return rebaseOntoReplace({op, base})
    case 'StringModification':
      return rebaseOntoStringModification({op, base})
  }
}

type OperationToRebase = Exclude<Operation, NoOp | Composite>

function rebaseOntoApply({op, base}: {op: OperationToRebase, base: Apply}): Operation {
  return NO_OP
}

function rebaseOntoListApply({op, base}: {op: OperationToRebase, base: ListApply}): Operation {
  return NO_OP
}

function rebaseOntoAdd({op, base}: {op: OperationToRebase, base: Add}): Operation {
  return NO_OP
}

function rebaseOntoRemove({op, base}: {op: OperationToRebase, base: Remove}): Operation {
  return NO_OP
}

function rebaseOntoMove({op, base}: {op: OperationToRebase, base: Move}): Operation {
  return NO_OP
}

function rebaseOntoReplace({op, base}: {op: OperationToRebase, base: Replace}): Operation {
  return NO_OP
}

function rebaseOntoStringModification({op, base}: {op: OperationToRebase, base: StringModification}): Operation {
  if (isStructuralOp(op)) {
    //Type mismatch: the other op would have failed
    return NO_OP
  }
  if (op.type === 'Replace') {
    // StringModification only makes sense after the original string
    return NO_OP

  }

  return rebaseStringOps({op, base})
}

function rebaseStringOps({base, op}: {op: StringModification, base: StringModification}): Operation {
  const baseDeletes = base.remove.length
  const baseInserts = base.add.length
  const baseIndex = base.index
  const baseEnd = base.index + base.remove.length

  const { index, add, remove } = op
  const end = index + remove.length

  if (end <= baseIndex) return op
  if (baseEnd <= index) {
    return stringModification({
      index: index + baseInserts - baseDeletes,
      add, remove,
    })
  }
  // The edits overlap somehow: index < baseEnd && baseIndex < end
  // This means that one of them has a delete, since inserts cannot overlap

  if (baseDeletes) {
    // const insert = stringModification({index: baseIndex, add: base.add})

    //Either op is an insert or otherwise so small that it's fully inside the deletions of the base op
    if (baseIndex <= index && end <= baseEnd) {
      return NO_OP
    }

    //op completely deletes the text that base had modified:
    if (index < baseIndex && baseEnd < end) {
      const baseIndexInsideOp = index - baseIndex
      return stringModification({
        index, add,
        remove: strSplice(remove, {index: baseIndexInsideOp, remove: base.remove, add: base.add})
      })
    }

    //index === end, so baseIndex < index < baseEnd
    //op is fully inside the deletions of base
    return NO_OP
  }

  //Base only inserts text and op deletes (and maybe inserts) some: baseIndex == baseEnd && index < baseIndex < end
  //Base is fully inside op. Just enlarge op
  const baseIndexInsideOp = baseIndex - index
  return stringModification({
    index, add,
    remove: strSplice(remove, {index: baseIndexInsideOp, remove: '', add: base.add})
  })
}
