import type { ErrorMap, Errors, ValidationProps } from '../types'
import { assoc, dissoc } from './data'

export async function validate(props: ValidationProps, value: unknown): Promise<Errors> {
  if (props.required && (value === null || value === undefined || value === '')) {
    return ['is required']
  }
  if (props.schema) {
    return props.schema.validate(value)
  }
  return []
}

export function hasErrors(map: ErrorMap): boolean {
  for (const _ in map) {
    return true
  }
  return false
}

export function withErrors(map: ErrorMap, key: string, errors: Errors): ErrorMap {
  return errors.length === 0
    ? dissoc(map, key)
    : assoc(map, key, errors)
}
