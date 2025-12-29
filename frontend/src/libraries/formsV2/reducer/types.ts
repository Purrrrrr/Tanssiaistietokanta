import { type Dispatch } from 'react'

import type { Errors, GenericPath } from '../types'

import { type CommonFormState } from './reducers/commonReducer'

export interface FormState<Data> extends CommonFormState {
  data: Data
}

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
  type: 'MOVE_ITEM'
  from: GenericPath
  fromIndex: number
  to: GenericPath
  toIndex: number
} | {
  type: 'REMOVE_ITEM'
  path: GenericPath
  index: number
} | {
  type: 'ADD_ITEM'
  path: GenericPath
  index: number
  value: unknown
}

export type ValidationAction = {
  type: 'SET_VALIDATION_RESULT'
  path: GenericPath
  id: string
  errors: Errors
} | {
  type: 'FORM_SUBMIT'
}

export type FocusAction = {
  type: 'FOCUS'
  path: GenericPath
  selection: Selection
} | {
  type: 'BLUR'
}

export type SubscriptionCallback<State> = (data: State) => unknown

export interface FormReducerResult<Data> {
  state: FormState<Data>
  dispatch: Dispatch<FormAction<Data>>
  subscribe: (callback: SubscriptionCallback<FormState<Data>>) => () => void
}
