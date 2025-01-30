import { createContext, Dispatch, useContext, useMemo, useRef } from 'react'
import { get } from 'partial.lenses'

import { PathFor, toArrayPath } from './types'

import { FormAction, FormState } from './reducer'

export interface FormStateContext<T> {
  getData(): T
  getValueAt<D>(path: PathFor<T>): D
  dispatch: Dispatch<FormAction<T>>
}

export const FormContext = createContext<FormStateContext<unknown>>({
  getData() { throw Error('No form context') },
  getValueAt() { throw Error('No form context') },
  dispatch() {}
})

export function useFormContext<T>(): FormStateContext<T> {
  return useContext(FormContext) as FormStateContext<T>
}

export function useFormContextValue<D>(state: FormState<D>, dispatch: Dispatch<FormAction<D>>): FormStateContext<D> {
  const valueRef = useRef<D>(state.data)
  valueRef.current = state.data

  return useMemo(
    () => ({
      getData() { return valueRef.current },
      getValueAt: (path: PathFor<D>) => get(toArrayPath(path), valueRef.current),
      dispatch,
    }),
    [dispatch]
  )
}
