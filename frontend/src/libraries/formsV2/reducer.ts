import { Reducer, useEffect, useReducer } from 'react'
import * as L from 'partial.lenses'

import createDebug from 'utils/debug'

import { PathFor, toArrayPath } from './types'

const debug = createDebug('formReducer')

type Selection = [number, number] | null

export type FormAction<Data> = {
  type: 'EXTERNAL_CHANGE'
  value: unknown
} | {
  type: 'CHANGE'
  path: PathFor<Data>
  value: unknown
} | {
  type: 'APPLY'
  path: PathFor<Data>
  modifier: (value: unknown) => unknown
} | {
  type: 'SUBSCRIBE'
  path: PathFor<Data>
  callback: SubscriptionCallback<Data>
} | {
  type: 'UNSUBSCRIBE'
  path: PathFor<Data>
  callback: SubscriptionCallback<Data>
} | {
  type: 'FOCUS'
  path: PathFor<Data>
  selection: Selection
} | {
  type: 'BLUR'
} | {
  type: 'SELECT'
  selection: Selection
} | {
  type: 'RUN_CALLBACKS'
}

export function change<Data>(path: PathFor<Data>, value: unknown): FormAction<Data> {
  return { type: 'CHANGE', path, value }
}
export function externalChange<Data>(value: unknown): FormAction<Data> {
  return { type: 'EXTERNAL_CHANGE', value }
}
export function apply<Data>(path: PathFor<Data>, modifier: (value: unknown) => unknown): FormAction<Data> {
  return { type: 'APPLY', path, modifier }
}
export function subscribe<Data>(path: PathFor<Data>, callback: SubscriptionCallback<Data>): FormAction<Data> {
  return { type: 'SUBSCRIBE', path, callback }
}
export function unsubscribe<Data>(path: PathFor<Data>, callback: SubscriptionCallback<Data>): FormAction<Data> {
  return { type: 'UNSUBSCRIBE', path, callback }
}

export interface FormState<Data> {
  focusedPath: PathFor<Data> | null
  selection: Selection
  data: Data
  subscriptions: Subscription<Data>[]
  callbacksToCall: CallbackData<Data>[]
}

export interface CallbackData<Data> {
  callback: SubscriptionCallback<Data>
  changedPath: PathFor<Data>
}
export interface Subscription<Data> {
  path: PathFor<Data>
  callback: SubscriptionCallback<Data>
}
export type SubscriptionCallback<Data> = (data: Data, path: PathFor<Data>) => unknown

export function useFormReducer<Data>(initialData: Data) {
  const result = useReducer<Reducer<FormState<Data>, FormAction<Data>>, Data>(withDebugReturnValue(reducer), initialData, getInitialState)
  const [{callbacksToCall}, dispatch] = result

  useEffect(
    () => {
      if (callbacksToCall.length > 0) dispatch({ type: 'RUN_CALLBACKS' })
    },
    [dispatch, callbacksToCall]
  )

  return result
}

function getInitialState<Data>(data: Data): FormState<Data> {
  return {
    focusedPath: null,
    selection: null,
    data,
    subscriptions: [],
    callbacksToCall: [],
  }
}

function withDebugReturnValue(fun: typeof reducer): typeof reducer {
  return (...args) => {
    const val = fun(...args)
    debug(val)
    return val
  }
}

function reducer<Data>(state: FormState<Data>, action: FormAction<Data>): FormState<Data> {
  debug(action)
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return addCallbacks(L.set('data', action.value, state), '')
    case 'CHANGE':
      return addCallbacks(
        L.set(['data', ...toArrayPath(action.path)], action.value, state),
        action.path
      )
    case 'APPLY':
      return addCallbacks(
        L.modify(['data', ...toArrayPath(action.path)], action.modifier, state),
        action.path
      )
    case 'SUBSCRIBE':
      return L.set(['subscriptions', L.appendTo], { path: action.path, callback: action.callback }, state)
    case 'UNSUBSCRIBE':
      return L.remove(['subscriptions', L.find((s: Subscription<Data>) => s.path === action.path && s.callback === action.callback)], state)
    case 'RUN_CALLBACKS': {
      const { callbacksToCall, data } = state
      callbacksToCall.forEach(({ callback, changedPath }) => callback(data, changedPath))
      return { ...state, callbacksToCall: [] }
    }
    case 'FOCUS':
    case 'BLUR':
    case 'SELECT':
      return state
  }
}

function addCallbacks<Data>(state: FormState<Data>, changedPath: PathFor<Data>): FormState<Data> {
  const newCallbacksToCall = state.subscriptions
    .filter(({path}) => {
      // callback path needs to be equal to changed path or a prefix
      if (!changedPath.startsWith(path)) return false
      // if it is a prefix, the changed path should be inside the field pointed by path
      if (changedPath.length == path.length) return true
      if (path[changedPath.length] === '.') return true

      return false
    })
    .map(({ callback }) => ({ callback, changedPath })) satisfies CallbackData<Data>[]
  return {
    ...state,
    callbacksToCall: [...state.callbacksToCall, ...newCallbacksToCall],
  }
}
