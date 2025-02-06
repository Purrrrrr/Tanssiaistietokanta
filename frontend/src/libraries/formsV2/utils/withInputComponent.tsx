import type { FieldInputComponent } from '../components/inputs'
import { type FieldProps, Field } from '../Field'

export function withComponent<Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>): (props: Omit<FieldProps<Input, Output, Extra>, 'component'>) => React.ReactElement {
  return props => {
    return <Field {...props as FieldProps<Input, Output, Extra>} component={c} />
  }
}
