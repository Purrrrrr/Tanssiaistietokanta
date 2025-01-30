import type { ComponentType } from 'react'

import { FieldContainer } from './components/FieldContainer/FieldContainer'
import { useFieldValueProps } from './hooks'
import type { PathFor, TypedPath, UserGivenFieldContainerProps } from './types'

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

export type FieldInputComponent<T, Extra = unknown> = ComponentType<FieldInputComponentProps<T> & Extra>

interface FieldInputComponentProps<T> {
  value: T
  onChange: (value: T) => unknown
}

export const TextInput : FieldInputComponent<string> = ({value, onChange}) =>
  <input value={value} onChange={e => onChange(e.target.value)} />
export const SuperTextInput = ({value, onChange, super: s} : FieldInputComponentProps<string | undefined> & { super: number, juttu?: string }) =>
  <>
    <input value={value} onChange={e => onChange(e.target.value)} />
    {s}
  </>

type FieldProps<T, Extra extends object>  = {
  path: PathFor<T>
  component: FieldInputComponent<T, Extra>
} & Omit<Extra, keyof FieldInputComponentProps<T>>
& UserGivenFieldContainerProps

export function Field<T, Extra extends object>({path, label, component: C, ...extra}: FieldProps<T, Extra>) {
  const { value, onChange } = useFieldValueProps<T>(path)

  return <FieldContainer label={label} id="" error={{errors: [path]}} errorId="" labelStyle="above">
    <C value={value} onChange={onChange} {...extra as Extra} />
  </FieldContainer>
}

export function withComponent<T, Extra extends object>(c: FieldInputComponent<T, Extra>): (p: Omit<FieldProps<T, Extra>, 'component'>) => React.ReactElement {
  return props => {
    return <Field {...props as FieldProps<T, Extra>} component={c} />
  }
}

export const InputField = withComponent(TextInput)

//const EF : ComponentType<ExternalFieldProps<

type ExternalFieldProps<Data, T, Extra extends object> = FieldProps<T, Extra> & {
  path: TypedPath<T, Data>
}

interface FormFor<Data> {
  Field: <T, Extra extends object>(props: ExternalFieldProps<Data, T, Extra>) => React.ReactElement
  withComponent: <T, Extra extends object>(c: FieldInputComponent<T, Extra>) => (p: Omit<ExternalFieldProps<Data, T, Extra>, 'component'>) => React.ReactElement
}

export function formFor<Data>(): FormFor<Data> {
  return { Field, withComponent }
}

const { Field : EF } = formFor<{a: string, n: number}>()

export const a = <EF label="fuu" path="a" component={SuperTextInput} super={2} juttu="" />
