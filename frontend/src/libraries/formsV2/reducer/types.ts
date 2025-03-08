import type { Errors, GenericPath } from '../types'

export type Selection = [number, number] | null

export type FormAction<Data> = ValueAction<Data> | ValidationAction | FocusAction

export type ValueAction<Data> = {
  type: 'EXTERNAL_CHANGE'
  value: Data
} | {
  type: 'CHANGE'
  path: GenericPath
  value: unknown
} | {
  type: 'APPLY'
  path: GenericPath
  modifier: (value: unknown) => unknown
}

export interface ValidationAction {
  type: 'SET_VALIDATION_RESULT'
  path: GenericPath
  id: string
  errors: Errors
}

export type FocusAction = {
  type: 'FOCUS'
  path: GenericPath
  selection: Selection
} | {
  type: 'BLUR'
}

export interface CallbackDefinition<State> {
  path: GenericPath
  callback: SubscriptionCallback<State>
}
export type SubscriptionCallback<State> = (data: State) => unknown
