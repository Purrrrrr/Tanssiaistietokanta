import type { FieldInputComponent } from '../components/inputs'
import { type FieldProps, type SelfLabeledFieldProps, type UnwrappedFieldProps, Field, SelfLabeledField, UnwrappedField } from '../Field'

export function asFormField<Input, Output extends Input, Extra extends object>(
  c: FieldInputComponent<Input, Output, Extra>): (props: Omit<FieldProps<Input, Output, Extra>, 'component'>
) => React.ReactElement {
  return props => {
    return <Field {...props as FieldProps<Input, Output, Extra>} component={c} />
  }
}

export function asUnwrappedFormField<Input, Output extends Input, Extra extends object>(
  c: FieldInputComponent<Input, Output, Extra>): (props: Omit<UnwrappedFieldProps<Input, Output, Extra>, 'component'>
) => React.ReactElement {
  return props => {
    return <UnwrappedField {...props as UnwrappedFieldProps<Input, Output, Extra>} component={c} />
  }
}

export function asSelfLabeledFormField<Input, Output extends Input, Extra extends object>(
  c: FieldInputComponent<Input, Output, Extra & {label: string}>): (props: Omit<SelfLabeledFieldProps<Input, Output, Extra>, 'component'>
) => React.ReactElement {
  return props => {
    return <SelfLabeledField<Input, Output, Extra> {...props as SelfLabeledFieldProps<Input, Output, Extra>} component={c} />
  }
}
