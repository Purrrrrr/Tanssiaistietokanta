import { ValidationAction } from '../types'
import type { Errors } from '../../types'

import { assoc, dissoc } from '../utils/data'

export type ErrorMap = Partial<Record<string, Errors>>
export interface FormValidationState {
  errors: ErrorMap
  isValid: boolean
  hasSubmitted: boolean
}

export const initialValidationState: FormValidationState = {
  errors: {},
  isValid: true,
  hasSubmitted: false,
}

export function validationReducer(state: FormValidationState, action: ValidationAction): FormValidationState {
  if (action.type === 'FORM_SUBMIT') {
    if (state.hasSubmitted) return state
    return {
      ...state,
      hasSubmitted: true,
    }
  }

  const { id, errors } = action
  const errorMap = errors === undefined
    ? dissoc(state.errors, id)
    : assoc(state.errors, id, errors)

  if (errorMap === state.errors) return state

  return {
    errors: errorMap,
    isValid: isValid(errorMap),
    hasSubmitted: state.hasSubmitted,
  }
}

function isValid(map: ErrorMap): boolean {
  for (const _ in map) {
    return false
  }
  return true
}
