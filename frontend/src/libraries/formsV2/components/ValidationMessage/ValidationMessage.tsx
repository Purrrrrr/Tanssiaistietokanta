import { useEffect, useSyncExternalStore } from 'react'
import equal from 'fast-deep-equal'

import { AnyType, GenericPath } from '../../types'

import { useFormContext } from '../../context'
import { setValidationResult } from '../../reducer'
import { ErrorMessage } from './ErrorMessage'
import { type ValidationProps, validate } from './validate'

interface ValidationMessageProps extends ValidationProps {
  id: string
  path: GenericPath
  value?: unknown
}

export function ValidationMessage(props: ValidationMessageProps) {
  const error = useRunValidation(props)
  return <ErrorMessage id={props.id} error={error} />

}

function useRunValidation(props: ValidationMessageProps) {
  const { id, path, value: maybeValue, ...validation } = props
  const { getState, getValueAt, dispatch, subscribe } = useFormContext<AnyType>()
  const error = useSyncExternalStore(subscribe, () => getState().validation.errors[id])
  const value = 'value' in props ? maybeValue : getValueAt(path)

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
