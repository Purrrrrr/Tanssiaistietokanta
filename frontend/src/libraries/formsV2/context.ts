import { createContext, useContext, useMemo, useRef } from 'react'
import { get } from 'partial.lenses'

import { DataPath, toArrayPath } from './types'

import { FormReducerResult, FormState } from './reducer'

export interface FormStateContext<D> extends Omit<FormReducerResult<D>, 'state'> {
  readOnly: boolean
  getState(): FormState<D>
  getValueAt<T>(path: DataPath<T, D>): T
}

export const FormContext = createContext<FormStateContext<unknown>>({
  readOnly: true,
  getState() { throw Error('No form context') },
  getValueAt() { throw Error('No form context') },
  dispatch() { throw Error('No form context') },
  subscribe() { throw Error('No form context') },
})

export function useFormContext<D>(): FormStateContext<D> {
  return useContext(FormContext) as FormStateContext<D>
}

export function useFormContextValue<D>(
  formReducer: FormReducerResult<D>, readOnly: boolean,
): FormStateContext<D> {
  const { state, dispatch, subscribe } = formReducer
  const stateRef = useRef<FormState<D>>(state)
  stateRef.current = state

  return useMemo(
    () => ({
      readOnly,
      getState() { return stateRef.current },
      getValueAt: <T>(path: DataPath<T, D>) => get(toArrayPath(path), stateRef.current.data),
      dispatch,
      subscribe,
    }),
    [readOnly, dispatch, subscribe],
  )
}
