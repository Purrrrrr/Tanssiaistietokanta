import { type ComponentProps, type ComponentType, type ReactElement } from 'react'

import type { ListPath, ValueAt } from './types'

import { type ListItem } from './components/dnd'
import { type FieldComponent, type FieldProps, asFormField, Field } from './components/Field'
import { type FormProps, Form } from './components/Form'
import type { DateInputProps, DateRangeInputProps, FieldInputComponent, FieldInputComponentProps, SelectorProps, SwitchProps } from './components/inputs'
import {
  AutocompleteInput, DateInput, DateRangeInput, FilterableSelect,
  MarkdownInput, Select, selectorWithType, Switch, TextInput,
} from './components/inputs'
import { type Range, type RangeFieldComponent, type RangeFieldProps, asRangeField, RangeField} from './components/RangeField'
import { type RepeatingFieldProps, RepeatingField } from './components/RepeatingField'
import { RepeatingSection, RepeatingSectionProps } from './components/RepeatingSection'
import { RepeatingTableRows, RepeatingTableRowsProps } from './components/RepeatingTableRows'
import { type SelfLabeledFieldComponent, asSelfLabeledFormField } from './components/SelflabeledField'
import { useAddItem, useAddItemAt, useChangeAt, useRemoveItem, useRemoveItemAt, useValueAt } from './hooks/externalHookApi'

export { withDefaults } from './withDefaults'
export { TextInput }
export type { FieldInputComponentProps }

type FieldComponentFor<Data, Component> = Component extends ComponentType<infer Props>
  ? Props extends FieldInputComponentProps<infer Output, infer Input>
    ? FieldComponent<Data, Output, ComponentProps<Component>, Input>
    : never
  : never

type GetSelectorWithType<Data> = <T>() => FieldComponent<Data, T, SelectorProps<T>, T>

interface FormFor<Data, AcceptedDroppableTypes = null> extends HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
  Field: FieldsFor<Data, AcceptedDroppableTypes>
  selectWithType: GetSelectorWithType<Data>
  autocompleteFieldWithType: GetSelectorWithType<Data>
  filterableSelectWithType: GetSelectorWithType<Data>
  RepeatingSection: <O extends ListItem>(t: RepeatingSectionProps<O, Data, AcceptedDroppableTypes>) => ReactElement
  RepeatingTableRows: <O extends ListItem>(t: RepeatingTableRowsProps<O, Data, AcceptedDroppableTypes>) => ReactElement
}

interface FieldsFor<Data, AcceptedDroppableTypes = null> {
  Custom: <Output extends Input, Extra, Input>(props: FieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  Range: <Output extends Input, Extra, Input>(props: RangeFieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withRangeComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Range<Output>, Extra, Range<Input>>) => RangeFieldComponent<Data, Output, Extra, Input>
  Date: FieldComponent<Data, Date | null, DateInputProps>
  DateRange: RangeFieldComponent<Data, Date | null, DateRangeInputProps>
  Markdown: FieldComponentFor<Data, typeof MarkdownInput>
  Text: FieldComponentFor<Data, typeof TextInput>
  Switch: SelfLabeledFieldComponent<Data, boolean, SwitchProps>
  Repeating: <O extends I & ListItem, E, I>(t: RepeatingFieldProps<O, E, I, Data, AcceptedDroppableTypes>) => ReactElement
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
  Field: {
    Custom: Field,
    withComponent: asFormField,
    Range: RangeField,
    withRangeComponent: asRangeField,
    Date: asFormField(DateInput),
    DateRange : asRangeField(DateRangeInput),
    Markdown: asFormField(MarkdownInput),
    Text: asFormField(TextInput),
    Switch: asSelfLabeledFormField(Switch),
    Repeating: RepeatingField,
  },
  selectWithType: <T>() => asFormField(selectorWithType<T>(Select)),
  autocompleteFieldWithType: <T>() => asFormField(selectorWithType<T>(AutocompleteInput)),
  filterableSelectWithType: <T>() => asFormField(selectorWithType<T>(FilterableSelect)),
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
