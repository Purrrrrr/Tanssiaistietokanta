import { type Dispatch, type Reducer, useCallback, useEffect, useReducer, useRef } from 'react'
import * as L from 'partial.lenses'

import createDebug from 'utils/debug'

import { isSubPathOf, toArrayPath } from './types'

import type { ErrorMap, Errors, PathFor } from './types'
import { apply as applyTo, merge, pluck } from './utils/data'
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
  path: PathFor<Data>
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
  path: PathFor<Data>
  selection: Selection
}

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
  changedPath: PathFor<Data>
}

interface CallbackDefinition<Data> {
  path: PathFor<Data>
  callback: SubscriptionCallback<Data>
}
export type SubscriptionCallback<Data> = (data: FormState<Data>) => unknown

export function useFormReducer<Data>(initialData: Data): FormReducerResult<Data> {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(debugReducer, initialData, getInitialState)
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
        if (isSubPathOf(state.changedPath, path)) {
          callback(state)
        }
      })
    },
    [state]
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
    changedPath: '',
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
      return merge(state, {
        data: action.value,
        changedPath: '',
      })
    case 'CHANGE':
      return merge(state, {
        data: L.set(toArrayPath(action.path), action.value, state.data),
        changedPath: action.path,
      })
    case 'APPLY':
      return merge(state, {
        data: L.modify(toArrayPath(action.path), action.modifier, state.data),
        changedPath: action.path,
      })
    case 'SET_VALIDATION_RESULT': {
      const errors = withErrors(state.errors, action.id, action.errors)
      if (errors === state.errors) return state
      return {
        ...state,
        errors,
        isValid: !hasErrors(errors),
        changedPath: action.path
      }
    }
    case 'FOCUS':
    case 'BLUR':
    case 'SELECT':
      return state
  }
}
