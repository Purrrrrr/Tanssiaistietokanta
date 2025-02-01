import { type ExternalFieldContainerProps, FieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, FieldInputComponentProps } from './components/inputs'
import { useFieldValueProps } from './hooks'
import type { PathFor } from './types'

/* TODO:
 *
 * working wrapper
 * validation
 * conflict handling
 * input field components
 * list editor
 * Translator into form -> auto translated labels
 *
 * DONE:
 * reducer logic, types etc.
 *
 */

export type FieldProps<Input, Output extends Input, Extra extends object>  = {
  path: PathFor<Input>
  component: FieldInputComponent<Input, Output, Extra>
} & Omit<Extra, keyof FieldInputComponentProps<Input, Output>>
& ExternalFieldContainerProps

export function Field<Input, Output extends Input, Extra extends object>({path, label, component: C, ...extra}: FieldProps<Input, Output, Extra>) {
  const { value, onChange } = useFieldValueProps<Input, Output>(path)

  return <FieldContainer label={label} id="" error={{errors: [path]}} errorId="" labelStyle="above">
    <C value={value} onChange={onChange} {...extra as Extra} />
  </FieldContainer>
}

export function withComponent<Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>): (props: Omit<FieldProps<Input, Output, Extra>, 'component'>) => React.ReactElement {
  return props => {
    return <Field {...props as FieldProps<Input, Output, Extra>} component={c} />
  }
}
