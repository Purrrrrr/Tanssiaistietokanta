import { createContext, useContext, useMemo, useRef } from 'react'
import { get } from 'partial.lenses'

import { PathFor, toArrayPath } from './types'

import { FormReducerResult, FormState } from './reducer'

export interface FormStateContext<T> extends Omit<FormReducerResult<T>, 'state'> {
  readOnly: boolean
  getState(): FormState<T>
  getValueAt<D>(path: PathFor<T>): D
}

export const FormContext = createContext<FormStateContext<unknown>>({
  readOnly: true,
  getState() { throw Error('No form context') },
  getValueAt() { throw Error('No form context') },
  dispatch() {},
  subscribe() {
    return () => {}
  },
  subscribeTo() {
    return () => () => {}
  },
})

export function useFormContext<T>(): FormStateContext<T> {
  return useContext(FormContext) as FormStateContext<T>
}

export function useFormContextValue<D>(
  formReducer: FormReducerResult<D>, readOnly: boolean
): FormStateContext<D> {
  const { state, dispatch, subscribe, subscribeTo } = formReducer
  const stateRef = useRef<FormState<D>>(state)
  stateRef.current = state

  return useMemo(
    () => ({
      readOnly,
      getState() { return stateRef.current },
      getValueAt: (path: PathFor<D>) => get(toArrayPath(path), stateRef.current.data),
      dispatch,
      subscribe,
      subscribeTo,
    }),
    [readOnly, dispatch, subscribe, subscribeTo]
  )
}
