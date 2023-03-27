import {ChangeSet, ObjectChangeSet} from './types'

import {Operation, toJSONPatch} from './jsonPatch'

export type PatchStrategy<T, Patch> = (original: T, modifications: T, changes: ChangeSet<T>) => Patch

export function noPatch<T>(_: T, modifications: T): T  {
  return modifications
}

export function partial<T>(original: T, modifications: T, changes: ChangeSet<T>): Partial<T>  {
  if (changes.type !== 'object') return modifications
  const objChange = changes as ObjectChangeSet<T>

  //TODO: conflict handling: do not overwrite conflicting server modifications when conflict system is ready
  const partial : Partial<T> = {}
  for (const key in objChange.changes) {
    partial[key] = modifications[key]
  }
  for (const key in objChange.additions) {
    partial[key] = modifications[key]
  }

  return partial
}

export function jsonPatch<T>(original: T, modifications: T, changes: ChangeSet<T>): Operation[]  {
  //TODO: conflict handling: do not overwrite conflicting server modifications when conflict system is ready
  return toJSONPatch(changes, 'LOCAL')
}
