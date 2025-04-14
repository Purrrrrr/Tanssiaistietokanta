import { type ComponentProps, type ComponentType, type ReactElement } from 'react'

import type { ValueAt } from './types'

import { type FieldComponent, type FieldProps, asFormField, Field } from './components/Field'
import { type FormProps, Form } from './components/Form'
import type { FieldInputComponent, FieldInputComponentProps, SwitchInputProps } from './components/inputs'
import { MarkdownInput, SwitchInput, TextInput } from './components/inputs'
import { ListItem } from './components/Repeater'
import { type RepeatingFieldProps, RepeatingField } from './components/RepeatingField'
import { type SelfLabeledFieldComponent, asSelfLabeledFormField } from './components/SelflabeledField'
import { useChangeAt, useValueAt } from './hooks'

export { TextInput }
export type { FieldInputComponentProps }

type FieldComponentFor<Data, Component> = Component extends ComponentType<infer Props>
  ? Props extends FieldInputComponentProps<infer Output, infer Input>
    ? FieldComponent<Data, Output, ComponentProps<Component>, Input>
    : never
  : never

interface FormFor<Data, AcceptedDroppableTypes = null> extends FieldsFor<Data, AcceptedDroppableTypes>, HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
}

interface FieldsFor<Data, AcceptedDroppableTypes = null> {
  Field: <Output extends Input, Extra, Input>(props: FieldProps<Output, Extra, Input, Data>) => React.ReactElement
  asFormField: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  MarkdownField: FieldComponentFor<Data, typeof MarkdownInput>
  TextField: FieldComponentFor<Data, typeof TextInput>
  Switch: SelfLabeledFieldComponent<Data, boolean, SwitchInputProps>
  RepeatingField: <O extends I & ListItem, E, I>(t: RepeatingFieldProps<O, E, I, Data, AcceptedDroppableTypes>) => ReactElement
}

interface HooksFor<Data> {
  useValueAt: <Path extends string>(path: Path) => ValueAt<Data, Path>
  useChangeAt: <Path extends string>(path: Path) => (value: ValueAt<Data, Path>) => unknown
}

const form = {
  Form,
  Field,
  asFormField,
  MarkdownField: asFormField(MarkdownInput),
  TextField: asFormField(TextInput),
  Switch: asSelfLabeledFormField(SwitchInput),
  RepeatingField,
  useValueAt,
  useChangeAt,
}

export function formFor<Data, AcceptedDroppableTypes = null>(): FormFor<Data, AcceptedDroppableTypes> {
  return form as FormFor<Data, AcceptedDroppableTypes>
}
