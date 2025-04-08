import { useId } from 'react'

import type { AnyType, GenericPath, Labelable } from './types'

import { type ConnectedFieldProps, ConnectedInput } from './components/ConnectedInput'
import { type ExternalFieldContainerProps, FieldContainer } from './components/containers/FieldContainer'

export type FieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & ExternalFieldContainerProps

export type SelfLabeledFieldProps<Output extends Input, Extra extends Labelable, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data>

export function Field<Output extends Input, Extra, Input, Data = AnyType>({containerClassName, inline, label, labelStyle, labelInfo, helperText, ...rest}: FieldProps<Output, Extra, Input, Data>) {
  const id = useFieldId(rest.path)

  return <FieldContainer
    inline={inline}
    labelFor={id}
    label={label}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
  >
    <ConnectedInput id={id} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} />
  </FieldContainer>
}

export function SelfLabeledField<Output extends Input, Extra extends Labelable, Input, Data = AnyType>({label, ...rest}: SelfLabeledFieldProps<Output, Extra, Input, Data>) {
  const id = useFieldId(rest.path)
  return <ConnectedInput id={id} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} label={label} />
}

function useFieldId(path: GenericPath): string {
  return `${path}:${useId()}`
}
