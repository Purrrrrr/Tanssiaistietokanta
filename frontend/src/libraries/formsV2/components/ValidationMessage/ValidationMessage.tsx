import { useEffect, useSyncExternalStore } from 'react'
import equal from 'fast-deep-equal'

import { AnyType, GenericPath } from '../../types'

import { useFormContext } from '../../context'
import { setValidationResult } from '../../reducer'
import { ErrorMessage } from './ErrorMessage'
import { validate, type ValidationProps } from './validate'

interface ValidationMessageProps<T> extends ValidationProps<T> {
  id: string
  path: GenericPath
  value?: unknown
}

export function ValidationMessage<T>(props: ValidationMessageProps<T>) {
  const error = useRunValidation(props)
  return <ErrorMessage id={props.id} error={error} />
}

function useRunValidation<T>(props: ValidationMessageProps<T>) {
  const { id, path, value: maybeValue, ...validation } = props
  const { getState, getValueAt, dispatch, subscribe, errorDisplay } = useFormContext<AnyType>()
  const error = useSyncExternalStore(subscribe, () => {
    const { errors, hasSubmitted } = getState().validation
    const displayError = (errorDisplay === 'always' || hasSubmitted)
    return displayError ? errors[id] : undefined
  })
  const value = 'value' in props ? maybeValue : getValueAt(path)

  useEffect(
    () => {
      validate(validation, value).then(errors => {
        const currentErrors = getState().validation.errors[id]
        if (equal(currentErrors, errors)) return
        dispatch(setValidationResult(path, id, errors))
      })
    },
    [path, id, dispatch, getState, value, validation],
  )
  useEffect(
    () => () => {
      if (id in getState().validation.errors) {
        dispatch(setValidationResult(path, id, undefined))
      }
    },
    [path, id, dispatch, getState],
  )

  return error
}
