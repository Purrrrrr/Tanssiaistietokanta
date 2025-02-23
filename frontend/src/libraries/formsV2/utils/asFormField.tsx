import type { FieldInputComponent } from '../components/inputs'
import { type FieldProps, type SelfLabeledFieldProps, type UnwrappedFieldProps, Field, SelfLabeledField, UnwrappedField } from '../Field'

export function asFormField<Output extends Input, Extra, Input>(
  c: FieldInputComponent<Output, Extra, Input>): (props: Omit<FieldProps<Output, Extra, Input>, 'component'>
) => React.ReactElement {
  return props => {
    return <Field {...props as FieldProps<Output, Extra, Input>} component={c} />
  }
}

export function asUnwrappedFormField<Output extends Input, Extra, Input>(
  c: FieldInputComponent<Output, Extra, Input>): (props: Omit<UnwrappedFieldProps<Output, Extra, Input>, 'component'>
) => React.ReactElement {
  return props => {
    return <UnwrappedField {...props as UnwrappedFieldProps<Output, Extra, Input>} component={c} />
  }
}

export function asSelfLabeledFormField<Output extends Input, Extra, Input>(
  c: FieldInputComponent<Output, Extra & {label: string}, Input>): (props: Omit<SelfLabeledFieldProps<Output, Extra, Input>, 'component'>
) => React.ReactElement {
  return props => {
    return <SelfLabeledField<Output, Extra, Input> {...props as SelfLabeledFieldProps<Output, Extra, Input>} component={c} />
  }
}
