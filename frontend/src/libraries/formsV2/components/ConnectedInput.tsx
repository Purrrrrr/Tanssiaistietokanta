import { useCallback } from 'react'

import type { AnyType, FieldPath } from '../types'

import { useFieldSubscription } from '../hooks/useFieldSubscription'
import { change } from '../reducer'
import type { FieldInputComponent, OmitInputProps } from './inputs'
import { type ValidationProps, ValidationMessage } from './ValidationMessage'

export type ConnectedFieldProps<Output extends Input, Extra, Input, Data = AnyType> = OmitInputProps<Extra> & ValidationProps<Input> & {
  component: FieldInputComponent<Output, Extra, Input>
  path: FieldPath<Input, Output, Data>
}

export type ConnectedInputProps<Output extends Input, Extra, Input, Data = AnyType> = ConnectedFieldProps<Output, Extra, Input, Data> & {
  id: string
}

export function ConnectedInput<Output extends Input, Extra, Input, Data = AnyType>({path, component: C, id, required, schema, ...extra}: ConnectedInputProps<Output, Extra, Input, Data>) {
  const errorId = `${id}-error`
  const inputProps = useFieldSubscription<Output, Input, Data>(
    useCallback((getValueAt) => getValueAt(path), [path]),
    useCallback((value, dispatch) => dispatch(change(path, value)), [path]),
  )
  return <>
    <C {...inputProps} id={id} aria-describedby={errorId} {...extra as Extra} />
    <ValidationMessage id={errorId} path={path} value={inputProps.value} required={required} schema={schema} />
  </>
}
