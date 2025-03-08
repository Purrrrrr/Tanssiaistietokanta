import { type Dispatch, type Reducer, useEffect, useReducer } from 'react'
import equal from 'fast-deep-equal'

import type { FormAction, SubscriptionCallback } from './types'
import type { GenericPath } from '../types'

import { externalChange } from './actionCreators'
import { debugReducer } from './debug'
import { type FocusState, focusReducer, initialFocusState } from './focusReducer'
import { useSubscriptions } from './subscriptions'
import { assoc, merge } from './utils'
import { FormValidationState, validationReducer } from './validationReducer'
import { valueReducer } from './valueReducer'

export * from './actionCreators'

export interface FormState<Data> extends FormValidationState {
  focus: FocusState
  data: Data
  lastChange?: {
    external?: boolean
    path: GenericPath
  }
}

export function useFormReducer<Data>(externalValue: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer(reducer), externalValue, getInitialState)
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
    data,
    errors: {},
    isValid: true,
  }
}

function reducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return merge(state, {
        data: valueReducer(state.data, action),
        lastChange: { path: '', external: true },
      })
    case 'CHANGE':
    case 'APPLY':
      return merge(state, {
        data: valueReducer(state.data, action),
        lastChange: { path: action.path },
      })
    case 'SET_VALIDATION_RESULT': {
      const { errors, isValid } = validationReducer(state, action)
      if (errors === state.errors) return state
      return merge(state, {
        errors,
        isValid,
        lastChange: { path: action.path },
      })
    }
    case 'FOCUS':
    case 'BLUR':
      return assoc(state, 'focus', focusReducer(state.focus, action))
  }
}
