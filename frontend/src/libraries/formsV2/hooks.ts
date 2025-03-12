import { useEffect, useSyncExternalStore } from 'react'
import equal from 'fast-deep-equal'

import { DataPath, GenericPath, ValidationProps } from './types'

import { useFormContext } from './context'
import { apply, change, setValidationResult } from './reducer'
import { validate } from './utils/validate'

export function useValueAt<T, Data = unknown>(path: DataPath<T, Data>): T {
  const { getValueAt, subscribe } = useFormContext<Data>()
  return useSyncExternalStore(subscribe, () => getValueAt<T>(path))
}

export function useChangeAt<T, Data = unknown>(path: DataPath<T, Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}

export function useApplyAt<T, Data = unknown>(path: DataPath<T, Data>) {
  const { dispatch } = useFormContext<Data>()

  return (modifier: (value: T) => T) => dispatch(apply(path, modifier as (value: unknown) => unknown))
}

export function useRunValidation(path: GenericPath, id: string, value: unknown, validation: ValidationProps) {
  const { getState, dispatch, subscribe } = useFormContext()
  const error = useSyncExternalStore(subscribe, () => getState().validation.errors[id])

  useEffect(
    () => {
      validate(validation, value).then(errors => {
        const currentErrors = getState().validation.errors[id]
        if (equal(currentErrors, errors)) return
        dispatch(setValidationResult(path, id, errors))
      })
    },
    [path, id, dispatch, getState, value, validation]
  )
  useEffect(
    () => () => {
      if (id in getState().validation.errors) {
        dispatch(setValidationResult(path, id, undefined))
      }
    },
    [path, id, dispatch, getState]
  )

  return error
}
