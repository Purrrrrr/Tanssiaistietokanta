import { type ComponentProps, type ComponentType } from 'react'

import type { Labelable, ValueAt } from './types'

import { type FieldInputComponent, type FieldInputComponentProps, type Nullable, type SwitchInputProps, MarkdownInput, SwitchInput, TextInput } from './components/inputs'
import { type FieldProps, type SelfLabeledFieldProps, Field } from './Field'
import { type FormProps, Form } from './Form'
import { useApplyAt, useChangeAt, useValueAt } from './hooks'
import { type SpecializedFieldComponent, asFormField, asSelfLabeledFormField } from './utils/asFormField'

export { TextInput }
export type { FieldInputComponentProps }
export { ListField } from './ListField'

const TextField = asFormField(TextInput)
const MarkdownField = asFormField(MarkdownInput)
const Switch = asSelfLabeledFormField(SwitchInput)

type FieldComponent<Data, Output extends Input, Extra, Input = Nullable<Output>> = SpecializedFieldComponent<FieldProps<Output, Extra, Input, Data>>
type SelfLabeledFieldComponent<Data, Output extends Input, Extra extends Labelable, Input = Nullable<Output>> = SpecializedFieldComponent<SelfLabeledFieldProps<Output, Extra, Input, Data>>

type FieldComponentFor<Data, Component> = Component extends ComponentType<infer Props>
  ? Props extends FieldInputComponentProps<infer Output, infer Input>
    ? FieldComponent<Data, Output, ComponentProps<Component>, Input>
    : never
  : never

interface FormFor<Data> extends FieldsFor<Data>, HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
}

interface FieldsFor<Data> {
  Field: <Output extends Input, Extra, Input>(props: FieldProps<Output, Extra, Input, Data>) => React.ReactElement
  asFormField: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  MarkdownField: FieldComponentFor<Data, typeof MarkdownInput>
  TextField: FieldComponentFor<Data, typeof TextInput>
  Switch: SelfLabeledFieldComponent<Data, boolean, SwitchInputProps>
}

interface HooksFor<Data> {
  useValueAt: <Path extends string>(path: Path) => ValueAt<Data, Path>
  useChangeAt: <Path extends string>(path: Path) => (value: ValueAt<Data, Path>) => unknown
  useApplyAt: <Path extends string>(path: Path) => (mapper: (val: ValueAt<Data, Path>) => ValueAt<Data, Path>) => unknown
}

export function formFor<Data>(): FormFor<Data> {
  return {
    Form,
    Field,
    asFormField,
    MarkdownField,
    TextField,
    Switch,
    useValueAt,
    useChangeAt,
    useApplyAt
  } as FormFor<Data>
}
