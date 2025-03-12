import { type Dispatch, type Reducer, useEffect, useReducer, useRef } from 'react'
import equal from 'fast-deep-equal'

import type { FormAction, SubscriptionCallback } from './types'
import type { GenericPath } from '../types'

import { externalChange } from './actionCreators'
import { type FocusState, focusReducer, initialFocusState } from './reducers/focusReducer'
import { FormValidationState, initialValidationState, validationReducer } from './reducers/validationReducer'
import { valueReducer } from './reducers/valueReducer'
import { assoc, dissoc } from './utils/data'
import { debugReducer } from './utils/debug'
import { useSubscriptions } from './utils/useSubscriptions'

export * from './actionCreators'

export interface FormState<Data> {
  focus: FocusState
  validation: FormValidationState
  data: Data
}

export function useFormReducer<Data>(externalData: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer(reducer), externalData, getInitialState)
  const [state, dispatch] = result
  const { subscribe, trigger } = useSubscriptions<FormState<Data>>()

  useEffect(
    () => { trigger(state) },
    [state, trigger]
  )

  const previousDataRef = useRef({
    external: externalData,
    internal: state.data,
  })
  useEffect(
    () => {
      const { current: previous } = previousDataRef
      const externalValueChanged = !equal(previous.external, externalData)
      const internalValueChanged = !equal(previous.internal, state.data)

      if (externalValueChanged && !equal(previous.internal, externalData)) {
        dispatch(externalChange(externalData))
      } else if (internalValueChanged && !equal(externalData, state.data)) {
        onChange(state.data)
      }

      previous.external = externalData
      previous.internal = state.data
    }, [externalData, state.data, dispatch, onChange]
  )

  return {
    state, dispatch, subscribe
  }
}

export interface FormReducerResult<Data> {
  state: FormState<Data>
  dispatch: Dispatch<FormAction<Data>>
  subscribe: (callback: SubscriptionCallback<FormState<Data>>, path?: GenericPath) => () => void
}

function getInitialState<Data>(data: Data): FormState<Data> {
  return {
    focus: initialFocusState,
    validation: initialValidationState,
    data,
  }
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
