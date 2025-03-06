import { Labelable } from '../types'

import type { FieldInputComponent } from '../components/inputs'
import { type FieldProps, type SelfLabeledFieldProps, type UnwrappedFieldProps, Field, SelfLabeledField, UnwrappedField } from '../Field'

export type SpecializedFieldComponent<P> = (props: Omit<P, 'component'>) => React.ReactElement

export function asFormField<Output extends Input, Extra, Input>(
  c: FieldInputComponent<Output, Extra, Input>): SpecializedFieldComponent<FieldProps<Output, Extra, Input>> {
  return props => {
    return <Field {...props as FieldProps<Output, Extra, Input>} component={c} />
  }
}

export function asUnwrappedFormField<Output extends Input, Extra, Input>(
  c: FieldInputComponent<Output, Extra, Input>): SpecializedFieldComponent<UnwrappedFieldProps<Output, Extra, Input>> {
  return props => {
    return <UnwrappedField {...props as UnwrappedFieldProps<Output, Extra, Input>} component={c} />
  }
}

export function asSelfLabeledFormField<Output extends Input, Extra extends Labelable, Input>(
  c: FieldInputComponent<Output, Extra & {label: string}, Input>): SpecializedFieldComponent<SelfLabeledFieldProps<Output, Extra, Input>> {
  return props => {
    return <SelfLabeledField<Output, Extra, Input> {...props as SelfLabeledFieldProps<Output, Extra, Input>} component={c} />
  }
}
