import { FocusAction, Selection } from './types'
import type { GenericPath } from '../types'

export interface FocusState {
  focusedPath: GenericPath | null
  selection: Selection
}

export const initialFocusState : FocusState = {
  focusedPath: null,
  selection: null,
}

export function focusReducer(state: FocusState, action: FocusAction): FocusState {
  return state
}
