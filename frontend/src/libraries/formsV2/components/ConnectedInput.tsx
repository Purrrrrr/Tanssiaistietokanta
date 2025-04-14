import { useCallback, useEffect, useState } from 'react'

import type { AnyType, FieldPath } from '../types'

import { useFormContext } from '../context'
import { change } from '../reducer'
import type { FieldInputComponent, OmitInputProps } from './inputs'
import { type ValidationProps, ValidationMessage } from './ValidationMessage'

export type ConnectedFieldProps<Output extends Input, Extra, Input, Data = AnyType> = OmitInputProps<Extra> & ValidationProps & {
  component: FieldInputComponent<Output, Extra, Input>
  path: FieldPath<Input, Output, Data>
}

export type ConnectedInputProps<Output extends Input, Extra, Input, Data = AnyType> = ConnectedFieldProps<Output, Extra, Input, Data> & {
  id: string
}

export function ConnectedInput<Output extends Input, Extra, Input, Data = AnyType>({path, component: C, id, required, schema, ...extra}: ConnectedInputProps<Output, Extra, Input, Data>) {
  const errorId = `${id}-error`
  const inputProps = useFieldValueProps<Output, Input, Data>(path)
  return <>
    <C {...inputProps} id={id} aria-describedby={errorId} {...extra as Extra} />
    <ValidationMessage id={errorId} path={path} value={inputProps.value} required={required} schema={schema} />
  </>
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: FieldPath<Input, Output, Data>) {
  const { readOnly, getValueAt, dispatch, subscribe } = useFormContext<Data>()
  const [value, setValue] = useState(() => getValueAt<Input>(path))

  useEffect(
    () => {
      setValue(getValueAt(path))
      subscribe(() => { setValue(getValueAt(path)) })
    },
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
