import { createContext, Dispatch, useContext, useMemo, useRef } from 'react'
import { get } from 'partial.lenses'

import { PathFor, toArrayPath } from './types'

import { FormAction, FormReducerResult, FormState } from './reducer'

export interface FormStateContext<T> extends Omit<FormReducerResult<T>, 'state'> {
  getState(): FormState<T>
  getValueAt<D>(path: PathFor<T>): D
}

export const FormContext = createContext<FormStateContext<unknown>>({
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
  state: FormState<D>, dispatch: Dispatch<FormAction<D>>, subscribe: FormStateContext<D>['subscribe'], subscribeTo: FormStateContext<D>['subscribeTo']
): FormStateContext<D> {
  const stateRef = useRef<FormState<D>>(state)
  stateRef.current = state

  return useMemo(
    () => ({
      getState() { return stateRef.current },
      getValueAt: (path: PathFor<D>) => get(toArrayPath(path), stateRef.current.data),
      dispatch,
      subscribe,
      subscribeTo,
    }),
    [dispatch, subscribe, subscribeTo]
  )
}
