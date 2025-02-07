import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react'
import * as L from 'partial.lenses'

import createDebug from 'utils/debug'

import { ErrorMap, Errors, PathFor, toArrayPath } from './types'

import { assoc } from './utils/data'
import { hasErrors, withErrors } from './utils/validation'

const debug = createDebug('formReducer')

type Selection = [number, number] | null

export type FormAction<Data> = {
  type: 'EXTERNAL_CHANGE'
  value: Data
} | {
  type: 'CHANGE'
  path: PathFor<Data>
  value: unknown
} | {
  type: 'APPLY'
  path: PathFor<Data>
  modifier: (value: unknown) => unknown
} | {
  type: 'SET_VALIDATION_RESULT'
  id: string
  errors: Errors
} | {
  type: 'FOCUS'
  path: PathFor<Data>
  selection: Selection
} | {
  type: 'BLUR'
} | {
  type: 'SELECT'
  selection: Selection
}

export function change<Data>(path: PathFor<Data>, value: unknown): FormAction<Data> {
  return { type: 'CHANGE', path, value }
}
export function externalChange<Data>(value: Data): FormAction<Data> {
  return { type: 'EXTERNAL_CHANGE', value }
}
export function setValidationResult<Data>(id: string, errors: Errors): FormAction<Data> {
  return { type: 'SET_VALIDATION_RESULT', id, errors }
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
}

export type SubscriptionCallback<Data> = (data: FormState<Data>) => unknown

export function useFormReducer<Data>(initialData: Data) {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer, initialData, getInitialState)
  const [state, dispatch] = result

  const callbacks = useRef<Set<SubscriptionCallback<Data>>>(new Set())
  const subscribe = useCallback(
    (subscription: SubscriptionCallback<Data>) => {
      callbacks.current.add(subscription)
      return () => { callbacks.current.delete(subscription) }
    }, []
  )

  useEffect(
    () => {
      callbacks.current.forEach(callback => callback(state))
    },
    [state]
  )

  return {
    state, dispatch, subscribe,
  }
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

function debugReducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  debug(action)
  const val = reducer(state, action)
  debug(val)
  return val
}

function reducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return assoc(state, 'data', action.value)
    case 'CHANGE':
      return L.set(['data', ...toArrayPath(action.path)], action.value, state)
    case 'APPLY':
      return L.modify(['data', ...toArrayPath(action.path)], action.modifier, state)
    case 'SET_VALIDATION_RESULT': {
      const errors = withErrors(state.errors, action.id, action.errors)
      return {
        ...state,
        errors,
        isValid: !hasErrors(errors)
      }
    }
    case 'FOCUS':
    case 'BLUR':
    case 'SELECT':
      return state
  }
}
