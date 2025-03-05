import { type Dispatch, type Reducer, useCallback, useEffect, useReducer, useRef } from 'react'
import equal from 'fast-deep-equal'

import type { FormAction, Selection } from './types'
import type { ErrorMap, Errors, PathFor } from '../types'
import { isSubPathOf } from '../types'

import { apply as applyTo, merge, pluck } from '../utils/data'
import { hasErrors, withErrors } from '../utils/validation'
import { debugReducer } from './debug'
import { valueReducer } from './valueReducer'

export function change<Data>(path: PathFor<Data>, value: unknown): FormAction<Data> {
  return { type: 'CHANGE', path, value }
}
export function externalChange<Data>(value: Data): FormAction<Data> {
  return { type: 'EXTERNAL_CHANGE', value }
}
export function setValidationResult<Data>(path: PathFor<Data>, id: string, errors: Errors): FormAction<Data> {
  return { type: 'SET_VALIDATION_RESULT', path, id, errors }
}
export function apply<Data>(path: PathFor<Data>, modifier: (value: unknown) => unknown): FormAction<Data> {
  return { type: 'APPLY', path, modifier }
}

export interface FormState<Data> {
  focusedPath: PathFor<Data> | null
  selection: Selection
  data: Data
  errors: ErrorMap
  isValid: boolean
  lastChange?: {
    external?: boolean
    path: PathFor<Data>
  }
}

interface CallbackDefinition<Data> {
  path: PathFor<Data>
  callback: SubscriptionCallback<Data>
}
export type SubscriptionCallback<Data> = (data: FormState<Data>) => unknown

export function useFormReducer<Data>(externalValue: Data, onChange: (changed: Data) => unknown): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer(reducer), externalValue, getInitialState)
  const [state, dispatch] = result

  const callbacks = useRef<CallbackDefinition<Data>[]>([])
  const subscribe = useCallback(
    (callback: SubscriptionCallback<Data>, path: PathFor<Data> = '') => {
      const callbackDefinition = { callback, path }
      callbacks.current.push(callbackDefinition)
      return () => { applyTo(callbacks, 'current', pluck(callbackDefinition)) }
    }, []
  )
  const subscribeTo = useCallback(
    (path: PathFor<Data>) => (c: SubscriptionCallback<Data>) => subscribe(c, path),
    [subscribe]
  )

  useEffect(
    () => {
      callbacks.current.forEach(({ callback, path }) => {
        if (state.lastChange && isSubPathOf(state.lastChange.path, path)) {
          callback(state)
        }
      })
    },
    [state]
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
  subscribe: (callback: SubscriptionCallback<Data>, path?: PathFor<Data>) => () => void
  subscribeTo: (path: PathFor<Data>) => (callback: SubscriptionCallback<Data>) => () => void
}

function getInitialState<Data>(data: Data): FormState<Data> {
  return {
    focusedPath: null,
    selection: null,
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
      const errors = withErrors(state.errors, action.id, action.errors)
      if (errors === state.errors) return state
      return {
        ...state,
        errors,
        isValid: !hasErrors(errors),
        lastChange: { path: action.path },
      }
    }
    case 'FOCUS':
    case 'BLUR':
    case 'SELECT':
      return state
  }
}
