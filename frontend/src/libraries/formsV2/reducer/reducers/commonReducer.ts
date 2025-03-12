import type { FocusAction, ValidationAction } from '../types'

import { assoc } from '../utils/data'
import { type FocusState, focusReducer, initialFocusState } from './focusReducer'
import { FormValidationState, initialValidationState, validationReducer } from './validationReducer'

export interface CommonFormState {
  focus: FocusState
  validation: FormValidationState
}

export const initialState = {
  focus: initialFocusState,
  validation: initialValidationState,
}

export type CommonReducerAction = ValidationAction | FocusAction

export function commonReducer(state: CommonFormState, action: CommonReducerAction): CommonFormState {
  switch (action.type) {
    case 'SET_VALIDATION_RESULT': {
      return assoc(state, 'validation', validationReducer(state.validation, action))
    }
    case 'FOCUS':
    case 'BLUR':
      return assoc(state, 'focus', focusReducer(state.focus, action))
  }
}
