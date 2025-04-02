import { useId } from 'react'

import type { AnyType, GenericPath, Labelable } from './types'

import { type ConnectedFieldProps, ConnectedInputComponent } from './components/ConnectedInput'
import { type ExternalBareFieldContainerProps, type ExternalFieldContainerProps, BareFieldContainer, FieldContainer } from './components/FieldContainer'

export type FieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & ExternalFieldContainerProps

export type UnwrappedFieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & ExternalBareFieldContainerProps

export type SelfLabeledFieldProps<Output extends Input, Extra extends Labelable, Input, Data = AnyType> =
  UnwrappedFieldProps<Output, Extra, Input, Data>

export function Field<Output extends Input, Extra, Input, Data = AnyType>({containerClassName, label, labelStyle, labelInfo, helperText, ...rest}: FieldProps<Output, Extra, Input, Data>) {
  const id = useFieldId(rest.path)

  return <FieldContainer
    labelFor={id}
    label={label}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
  >
    <ConnectedInputComponent id={id} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} />
  </FieldContainer>
}


export function UnwrappedField<Output extends Input, Extra, Input, Data = AnyType>({label, ...rest}: UnwrappedFieldProps<Output, Extra, Input, Data>) {
  const id = useFieldId(rest.path)
  return <BareFieldContainer labelFor={id} label={label}>
    <ConnectedInputComponent id={id} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} />
  </BareFieldContainer>
}

export function SelfLabeledField<Output extends Input, Extra extends Labelable, Input, Data = AnyType>({label, ...rest}: SelfLabeledFieldProps<Output, Extra, Input, Data>) {
  const id = useFieldId(rest.path)
  return <BareFieldContainer labelFor={id}>
    <ConnectedInputComponent id={id} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} label={label} />
  </BareFieldContainer>
}

function useFieldId(path: GenericPath): string {
  return `${path}:${useId()}`
}
