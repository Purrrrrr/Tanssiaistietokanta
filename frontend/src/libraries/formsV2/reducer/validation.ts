import type { ErrorMap, Errors } from '../types'

import { assoc, dissoc } from './utils'

export function hasErrors(map: ErrorMap): boolean {
  for (const _ in map) {
    return true
  }
  return false
}

export function withErrors(map: ErrorMap, key: string, errors: Errors): ErrorMap {
  return errors === undefined
    ? dissoc(map, key)
    : assoc(map, key, errors)
}
