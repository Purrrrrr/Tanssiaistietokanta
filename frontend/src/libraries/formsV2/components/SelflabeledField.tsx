import { useId } from 'react'

import type { AnyType, SpecializedFieldComponent } from '../types'

import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import type { FieldInputComponent, Nullable } from './inputs'

export type SelfLabeledFieldProps<Output extends Input, Extra extends Labelable, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data>

interface Labelable {
  label: string
}

export function SelfLabeledField<Output extends Input, Extra extends Labelable, Input, Data = AnyType>({ label, ...rest }: SelfLabeledFieldProps<Output, Extra, Input, Data>) {
  return <ConnectedInput id={useId()} {...rest as ConnectedFieldProps<Output, Extra, Input, Data> & Extra} label={label} />
}

export type SelfLabeledFieldComponent<Data, Output extends Input, Extra extends Labelable, Input = Nullable<Output>> = SpecializedFieldComponent<SelfLabeledFieldProps<Output, Extra, Input, Data>>

export function asSelfLabeledFormField<Output extends Input, Extra extends Labelable, Input, Data = AnyType>(
  c: FieldInputComponent<Output, Extra & { label: string }, Input>): SelfLabeledFieldComponent<Data, Output, Extra, Input> {
  return props => {
    return <SelfLabeledField<Output, Extra, Input, Data> {...props as SelfLabeledFieldProps<Output, Extra, Input, Data>} component={c} />
  }
}
