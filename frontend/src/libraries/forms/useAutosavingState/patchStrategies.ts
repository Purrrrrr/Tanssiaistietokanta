import deepEquals from 'fast-deep-equal'

import {Operation, toJSONPatch} from './jsonPatch'

export type PatchStrategy<T, Patch> = (original: T, modifications: T) => Patch | undefined

export function noPatch<T>(_: T, modifications: T): T  {
  return modifications
}

export function partial<T>(original: T, modifications: T): Partial<T> | undefined  {
  if (typeof modifications !== 'object' || modifications === null) {
    if (modifications === original) return undefined
    return modifications
  }

  let modified = false

  const partial : Partial<T> = {}
  for (const key of Object.keys(modifications)) {
    if (!deepEquals(original[key], modifications[key])) {
      partial[key] = modifications[key]
      modified = true
    }
  }

  return modified ? partial : undefined
}

export function jsonPatch<T>(original: T, modifications: T): Operation[] | undefined {
  const patch = toJSONPatch(original, modifications)
  return patch.length > 0 ? patch : undefined
}
