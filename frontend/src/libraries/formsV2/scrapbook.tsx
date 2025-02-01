import type { ComponentType } from 'react'

import { FieldContainer } from './components/FieldContainer/FieldContainer'
import { useFieldValueProps } from './hooks'
import type { FieldPath, PathFor, UserGivenFieldContainerProps } from './types'

//import {Reducer, useReducer} from 'react'

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

export type FieldInputComponent<Input, Output extends Input, Extra = unknown> = ComponentType<FieldInputComponentProps<Input, Output> & Extra>

interface FieldInputComponentProps<Input, Output extends Input> {
  value: Input
  onChange: (value: Output) => unknown
}

export const TextInput : FieldInputComponent<string | undefined | null, string> = ({value, onChange}) =>
  <input value={value ?? ''} onChange={e => onChange(e.target.value)} />

type FieldProps<Input, Output extends Input, Extra extends object>  = {
  path: PathFor<Input>
  component: FieldInputComponent<Input, Output, Extra>
} & Omit<Extra, keyof FieldInputComponentProps<Input, Output>>
& UserGivenFieldContainerProps

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

export const TextField = withComponent(TextInput)

type ExternalFieldProps<Data, Input, Output extends Input, Extra extends object> = FieldProps<Input, Output, Extra> & {
  path: FieldPath<Input, Output, Data>
}

type SpecializedFieldComponentFor<Data, Input, Output extends Input, Extra extends object> = (p: Omit<ExternalFieldProps<Data, Input, Output, Extra>, 'component'>) => React.ReactElement

interface FormFor<Data> {
  Field: <Input, Output extends Input, Extra extends object>(props: ExternalFieldProps<Data, Input, Output, Extra>) => React.ReactElement
  withComponent: <Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>) => SpecializedFieldComponentFor<Data, Input, Output, Extra>
  TextField: SpecializedFieldComponentFor<Data, string | undefined | null, string, object>
}

export function formFor<Data>(): FormFor<Data> {
  return {
    Field,
    withComponent,
    TextField: TextField
  } as FormFor<Data>
}
