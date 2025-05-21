import { useId } from 'react'

import type { AnyType, SpecializedFieldComponent } from '../types'

import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import { type ExternalFieldContainerProps, FieldContainer } from './containers/FieldContainer'
import type { FieldInputComponent, Nullable } from './inputs'

export type FieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & ExternalFieldContainerProps

export function Field<Output extends Input, Extra, Input, Data = AnyType>({containerClassName, inline, label, labelStyle, labelInfo, helperText, ...rest}: FieldProps<Output, Extra, Input, Data>) {
  const id = useId()

  return <FieldContainer
    inline={inline}
    labelFor={id}
    label={label}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
  >
    <ConnectedInput id={id} aria-label={label} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} />
  </FieldContainer>
}

export type FieldComponent<Data, Output extends Input, Extra, Input = Nullable<Output>> =
  SpecializedFieldComponent<FieldProps<Output, Extra, Input, Data>>

export function asFormField<Output extends Input, Extra, Input, Data = AnyType>(
  c: FieldInputComponent<Output, Extra, Input>): FieldComponent<Data, Output, Extra, Input> {
  return props => {
    return <Field {...props as FieldProps<Output, Extra, Input, Data>} component={c} />
  }
}
