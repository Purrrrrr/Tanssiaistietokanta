import { useEffect, useSyncExternalStore } from 'react'
import equal from 'fast-deep-equal'

import { PathFor, ValidationProps } from './types'

import { useFormContext } from './context'
import { apply, change, setValidationResult } from './reducer'
import { validate } from './utils/validation'

export function useValueAt<T, Data = unknown>(path: PathFor<Data>): T {
  const { getValueAt, subscribe } = useFormContext()
  return useSyncExternalStore(subscribe, () => getValueAt<T>(path))
}

export function useChangeAt<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}

export function useApplyAt<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (modifier: (value: T) => T) => dispatch(apply(path, modifier as (value: unknown) => unknown))
}

export function useRunValidation(path: string, id: string, value: unknown, validation: ValidationProps) {
  const { getState, dispatch, subscribeTo } = useFormContext()
  const error = useSyncExternalStore(subscribeTo(path), () => getState().errors[id])

  useEffect(
    () => {
      validate(validation, value).then(errors => {
        const currentErrors = getState().errors[id]
        if (equal(currentErrors, errors)) return
        dispatch(setValidationResult(path, id, errors))
      })
    },
    [path, id, dispatch, getState, value, validation]
  )
  useEffect(
    () => () => {
      if (id in getState().errors) {
        dispatch(setValidationResult(path, id, undefined))
      }
    },
    [path, id, dispatch, getState]
  )

  return error
}
