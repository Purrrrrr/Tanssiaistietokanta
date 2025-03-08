import { type Dispatch, type Reducer, useEffect, useReducer } from 'react'
import equal from 'fast-deep-equal'

import type { FormAction, SubscriptionCallback } from './types'
import type { GenericPath } from '../types'

import { externalChange } from './actionCreators'
import { debugReducer } from './debug'
import { type FocusState, focusReducer, initialFocusState } from './reducers/focusReducer'
import { FormValidationState, initialValidationState, validationReducer } from './reducers/validationReducer'
import { valueReducer } from './reducers/valueReducer'
import { useSubscriptions } from './subscriptions'
import { assoc, dissoc } from './utils'

export * from './actionCreators'

export interface FormState<Data> {
  focus: FocusState
  validation: FormValidationState
  data: Data
  lastChange?: LastChange
}

interface LastChange {
  external?: boolean
  path: GenericPath
}

export function useFormReducer<Data>(externalValue: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer(lastChangeReducer), externalValue, getInitialState)
  const [state, dispatch] = result
  const { subscribe, subscribeTo, trigger } = useSubscriptions<FormState<Data>>()

  useEffect(
    () => {
      if (state.lastChange) {
        trigger(state.lastChange.path, state)
      }
    },
    [state, trigger]
  )

  const externalValueChanged = equal(state.data, externalValue)

  useEffect(
    () => {
      if (externalValueChanged) {
        dispatch(externalChange(externalValue))
      }
    },
    [externalValue, externalValueChanged, dispatch]
  )

  return {
    state, dispatch, subscribe, subscribeTo,
  }
}

export interface FormReducerResult<Data> {
  state: FormState<Data>
  dispatch: Dispatch<FormAction<Data>>
  subscribe: (callback: SubscriptionCallback<FormState<Data>>, path?: GenericPath) => () => void
  subscribeTo: (path: GenericPath) => (callback: SubscriptionCallback<FormState<Data>>) => () => void
}

function getInitialState<Data>(data: Data): FormState<Data> {
  return {
    focus: initialFocusState,
    validation: initialValidationState,
    data,
  }
}

function lastChangeReducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  const newState = reducer(state, action)
  if (newState === state) {
    return dissoc(state, 'lastChange')
  }
  return assoc(newState, 'lastChange', lastChange(action))
}

function reducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
    case 'CHANGE':
    case 'APPLY':
      return assoc(state, 'data', valueReducer(state.data, action))
    case 'SET_VALIDATION_RESULT': {
      return assoc(state, 'validation', validationReducer(state.validation, action))
    }
    case 'FOCUS':
    case 'BLUR':
      return assoc(state, 'focus', focusReducer(state.focus, action))
  }
}

function lastChange(action: FormAction<unknown>): LastChange | undefined {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return { path: '', external: true }
    case 'CHANGE':
    case 'APPLY':
    case 'SET_VALIDATION_RESULT':
      return { path: action.path }
    case 'FOCUS':
    case 'BLUR':
      return
  }
}
