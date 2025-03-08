import type { FormAction } from './types'
import type { Errors, GenericPath } from '../types'

export function change<Data>(path: GenericPath, value: unknown): FormAction<Data> {
  return { type: 'CHANGE', path, value }
}
export function externalChange<Data>(value: Data): FormAction<Data> {
  return { type: 'EXTERNAL_CHANGE', value }
}
export function setValidationResult<Data>(path: GenericPath, id: string, errors: Errors): FormAction<Data> {
  return { type: 'SET_VALIDATION_RESULT', path, id, errors }
}
export function apply<Data>(path: GenericPath, modifier: (value: unknown) => unknown): FormAction<Data> {
  return { type: 'APPLY', path, modifier }
}
