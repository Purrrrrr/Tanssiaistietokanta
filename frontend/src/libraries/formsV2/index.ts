import { type ComponentProps, type ComponentType, type ReactElement } from 'react'

import type { ListPath, ValueAt } from './types'

import { type ListItem } from './components/dnd'
import { type FieldComponent, type FieldProps, asFormField, Field } from './components/Field'
import { type FormProps, Form } from './components/Form'
import type { FieldInputComponent, FieldInputComponentProps, SwitchInputProps } from './components/inputs'
import { MarkdownInput, SwitchInput, TextInput } from './components/inputs'
import { type RepeatingFieldProps, RepeatingField } from './components/RepeatingField'
import { RepeatingSection, RepeatingSectionProps } from './components/RepeatingSection'
import { RepeatingTableRows, RepeatingTableRowsProps } from './components/RepeatingTableRows'
import { type SelfLabeledFieldComponent, asSelfLabeledFormField } from './components/SelflabeledField'
import { useAddItem, useAddItemAt, useChangeAt, useRemoveItem, useRemoveItemAt, useValueAt } from './hooks'

export { TextInput }
export type { FieldInputComponentProps }

type FieldComponentFor<Data, Component> = Component extends ComponentType<infer Props>
  ? Props extends FieldInputComponentProps<infer Output, infer Input>
    ? FieldComponent<Data, Output, ComponentProps<Component>, Input>
    : never
  : never

interface FormFor<Data, AcceptedDroppableTypes = null> extends FieldsFor<Data, AcceptedDroppableTypes>, HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
  RepeatingSection: <O extends ListItem>(t: RepeatingSectionProps<O, Data, AcceptedDroppableTypes>) => ReactElement
  RepeatingTableRows: <O extends ListItem>(t: RepeatingTableRowsProps<O, Data, AcceptedDroppableTypes>) => ReactElement
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
  useAddItem: () => <Path extends ListPath<Data>>(path: Path, value: ValueAt<Data, `${Path}.${number}`>, index?: number) => unknown
  useAddItemAt: <Path extends ListPath<Data>>(path: Path) => (value: ValueAt<Data, `${Path}.${number}`>, index?: number) => unknown
  useRemoveItem: () => <Path extends ListPath<Data>>(path: Path, index: number) => unknown
  useRemoveItemAt: <Path extends ListPath<Data>>(path: Path) => (index: number) => unknown
}

const form = {
  Form,
  RepeatingSection,
  RepeatingTableRows,
  Field,
  asFormField,
  MarkdownField: asFormField(MarkdownInput),
  TextField: asFormField(TextInput),
  Switch: asSelfLabeledFormField(SwitchInput),
  RepeatingField,
  useValueAt,
  useChangeAt,
  useAddItem,
  useAddItemAt,
  useRemoveItem,
  useRemoveItemAt,
}

export function formFor<Data, AcceptedDroppableTypes = null>(): FormFor<Data, AcceptedDroppableTypes> {
  return form as FormFor<Data, AcceptedDroppableTypes>
}
