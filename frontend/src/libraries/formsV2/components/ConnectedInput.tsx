import { useCallback, useEffect, useState } from 'react'

import type { AnyType, FieldPath, ValidationProps } from '../types'

import { useFormContext } from '../context'
import { useRunValidation } from '../hooks'
import { change } from '../reducer'
import {ErrorMessage} from './ErrorMessage'
import type { FieldInputComponent, OmitInputProps } from './inputs'


export type ConnectedInputComponentProps<Output extends Input, Extra, Input, Data = AnyType> = ConnectedFieldProps<Output, Extra, Input, Data> & {
  id: string
}
export type ConnectedFieldProps<Output extends Input, Extra, Input, Data = AnyType> = OmitInputProps<Extra> & ValidationProps & {
  component: FieldInputComponent<Output, Extra, Input>
  path: FieldPath<Input, Output, Data>
}

export function ConnectedInputComponent<Output extends Input, Extra, Input, Data = AnyType>({path, component: C, id, required, schema, ...extra}: ConnectedInputComponentProps<Output, Extra, Input, Data>) {
  const errorId = `${id}-error`
  const inputProps = useFieldValueProps<Output, Input, Data>(path)
  const error = useRunValidation(path, id, inputProps.value, { required, schema })
  return <>
    <C {...inputProps} id={id} aria-describedby={errorId} {...extra as Extra} />
    <ErrorMessage id={errorId} error={error} />
  </>
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: FieldPath<Input, Output, Data>) {
  const { readOnly, getValueAt, dispatch, subscribe } = useFormContext<Data>()
  const [value, setValue] = useState(() => getValueAt<Input>(path))

  useEffect(
    () => subscribe(() => setValue(getValueAt(path))),
    [subscribe, path, getValueAt]
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])

  return {
    value, onChange, readOnly
  }
}
