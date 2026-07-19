import deepEquals from 'fast-deep-equal'

import { Operation, toJSONPatch } from './jsonPatch'

export type PatchStrategy<T, Patch> = (original: T, modifications: T) => Patch | undefined

function partial<T>(original: T, modifications: T): Partial<T> | undefined {
  if (typeof modifications !== 'object' || modifications === null) {
    if (modifications === original) return undefined
    return modifications
  }

  let modified = false

  const partial: Partial<T> = {}
  for (const key of Object.keys(modifications)) {
    if (!deepEquals(original[key], modifications[key])) {
      partial[key] = modifications[key]
      modified = true
    }
  }

  return modified ? partial : undefined
}

function jsonPatch<T>(original: T, modifications: T): Operation[] | undefined {
  const patch = toJSONPatch(original, modifications)
  return patch.length > 0 ? patch : undefined
}

const identity = item => item

function jsonPatchWithFields<T extends object>(fields: readonly (keyof T)[], patchFunction: (item: T) => object = identity): PatchStrategy<T, Operation[]> {
  return (original: T, modifications: T) => {
    const patch = toJSONPatch(
      patchFunction(pick(original, fields)),
      patchFunction(pick(modifications, fields)),
    )
    return patch.length > 0 ? patch : undefined
  }
}

function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

export default {
  partial,
  jsonPatch,
  jsonPatchWithFields,
}
