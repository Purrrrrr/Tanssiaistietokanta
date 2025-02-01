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
 * reducer logic, types etc.
 * input field components
 * list editor
 * Translator into form -> auto translated labels
 *
 *
 *
 */

export type FieldInputComponent<Input, Output extends Input, Extra = unknown> = ComponentType<FieldInputComponentProps<Input, Output> & Extra>

interface FieldInputComponentProps<Input, Output extends Input> {
  value: Input
  onChange: (value: Output) => unknown
}

export const TextInput : FieldInputComponent<string | undefined | null, string> = ({value, onChange}) =>
  <input value={value ?? ''} onChange={e => onChange(e.target.value)} />
export const SuperTextInput = ({value, onChange, super: s} : FieldInputComponentProps<string | undefined, string> & { super: number, juttu?: string }) =>
  <>
    <input value={value ?? ''} onChange={e => onChange(e.target.value)} />
    {s}
  </>

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

export const InputField = withComponent(TextInput)

type ExternalFieldProps<Data, Input, Output extends Input, Extra extends object> = FieldProps<Input, Output, Extra> & {
  path: FieldPath<Input, Output, Data>
}

interface FormFor<Data> {
  Field: <Input, Output extends Input, Extra extends object>(props: ExternalFieldProps<Data, Input, Output, Extra>) => React.ReactElement
  withComponent: <Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>) => (p: Omit<ExternalFieldProps<Data, Input, Output, Extra>, 'component'>) => React.ReactElement
}

export function formFor<Data>(): FormFor<Data> {
  return { Field, withComponent } as FormFor<Data>
}

const { Field : EF } = formFor<{a: string, n: number}>()

export const a = <EF label="fuu" path="a" component={SuperTextInput} super={2} juttu="" />
