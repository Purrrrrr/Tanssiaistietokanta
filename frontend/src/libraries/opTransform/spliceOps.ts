import {
  add,
  ListSplice,
  remove,
  Splice,
  Value,
} from './types'

import { splice } from './utils'

export function indexAfterSpliceOp(index: number, op: Splice<Value[] | string>): number {
  const indexOp = add(index, [0]) as ListSplice
  return rebaseSpliceOps(op, indexOp, []).index
}

export function elementIndexAfterSpliceOp(index: number, op: Splice<Value[] | string>): number | null {
  const indexOp = remove(index, [0]) as ListSplice
  const {index: newIndex, remove: remainingRemove} = rebaseSpliceOps(op, indexOp, [])

  if (remainingRemove?.length === 0) return null
  return newIndex
}

export function rebaseSpliceOps<T extends string | Value[]>(base: Splice<T>, op: Splice<T>, emptyVal: T): SpliceOpChange<T> {
  const baseDeletes = base.remove.length
  const baseInserts = base.add.length
  const baseIndex = base.index
  const baseEnd = base.index + base.remove.length

  const { index, remove } = op
  const end = index + remove.length

  if (end <= baseIndex) {
    //    BASE
    // OP
    return {index}
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
      return { index, remove: remove.slice(0, index - baseIndex) as T }
    }
    // baseEnd < end
    if (index < baseIndex) {
      //   BASE
      // ---OP---
      //op completely deletes the text that base had modified:
      const baseIndexInsideOp = baseIndex - index
      return {
        index,
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
    index,
    remove: splice(remove, {index: baseIndexInsideOp, remove: emptyVal, add: base.add}) as T
  }
}

interface SpliceOpChange<T> {
  index: number
  remove?: T
}
