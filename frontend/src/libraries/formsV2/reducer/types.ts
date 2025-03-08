import type { Errors, GenericPath } from '../types'

export type Selection = [number, number] | null

export type FormAction<Data> = ValueAction<Data> | {
  type: 'SET_VALIDATION_RESULT'
  path: GenericPath
  id: string
  errors: Errors
} | {
  type: 'FOCUS'
  path: GenericPath
  selection: Selection
} | {
  type: 'BLUR'
} | {
  type: 'SELECT'
  path: GenericPath
  selection: Selection
}

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

export interface CallbackDefinition<State> {
  path: GenericPath
  callback: SubscriptionCallback<State>
}
export type SubscriptionCallback<State> = (data: State) => unknown
