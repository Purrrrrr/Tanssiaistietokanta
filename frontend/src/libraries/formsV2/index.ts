import { type ComponentType, type ReactElement, lazy } from 'react'

import { type ListItem } from './components/dnd'
import { type FieldComponent, type FieldProps, asFormField, Field } from './components/Field'
import { type FormProps, Form } from './components/Form'
import type { DateInputProps, DateRangeInputProps, FieldInputComponent, FieldInputComponentProps, SelectorProps, SelectProps, SwitchProps } from './components/inputs'
import {
  AutocompleteInput, Select, Switch,
} from './components/inputs'
import { type MarkdownEditorProps } from './components/inputs/MarkdownInput'
import { type TextInputExtraProps } from './components/inputs/TextInput'
import { type Range, type RangeFieldComponent, type RangeFieldProps, asRangeField, RangeField } from './components/RangeField'
import { type RepeatingSectionProps } from './components/RepeatingSection'
import { type RepeatingTableRowsProps } from './components/RepeatingTableRows'
import { type SelfLabeledFieldComponent, asSelfLabeledFormField } from './components/SelflabeledField'
import hookApi, { type HooksFor } from './hooks/externalHookApi'

export { withDefaults } from './utils/withDefaults'
export type { FieldInputComponentProps }

interface FormFor<Data, AcceptedDroppableTypes = null> extends HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
  Field: FieldsFor<Data, AcceptedDroppableTypes>
  selectWithType: <T>() => FieldComponent<Data, T, SelectProps<T>, T>
  autocompleteWithType: <T>() => FieldComponent<Data, T, SelectorProps<T>, T>
  RepeatingSection: <O extends ListItem>(t: RepeatingSectionProps<O, Data, AcceptedDroppableTypes>) => ReactElement
  RepeatingTableRows: <O extends ListItem>(t: RepeatingTableRowsProps<O, Data, AcceptedDroppableTypes>) => ReactElement
}

interface FieldsFor<Data, _AcceptedDroppableTypes = null> {
  Custom: <Output extends Input, Extra, Input>(props: FieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  Range: <Output extends Input, Extra, Input>(props: RangeFieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withRangeComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Range<Output>, Extra, Range<Input>>) => RangeFieldComponent<Data, Output, Extra, Input>
  Date: FieldComponent<Data, Date | null, DateInputProps>
  DateRange: RangeFieldComponent<Data, Date | null, DateRangeInputProps>
  Markdown: FieldComponent<Data, string, MarkdownEditorProps>
  Text: FieldComponent<Data, string, TextInputExtraProps>
  Switch: SelfLabeledFieldComponent<Data, boolean, SwitchProps>
  // Repeating: <O extends I & ListItem, E, I>(t: RepeatingFieldProps<O, E, I, Data, AcceptedDroppableTypes>) => ReactElement
}

/*

{
  Form,
  RepeatingSection,
  RepeatingTableRows,
  Field:
    .withComponent
  RangeField
    .withComponent
  DateSelector: asFormField(DateInput),
  DateRangeSelector : asRangeField(DateRangeInput),
  MarkdownInput: asFormField(MarkdownInput),
  TextInput: asFormField(TextInput),
  Switch: asSelfLabeledFormField(Switch),
    .for
  DurationInput
  NumberInput
  RadioGroup?
}


*/

const form = {
  Form,
  RepeatingSection: lazy(() => import('./components/RepeatingSection')),
  RepeatingTableRows: lazy(() => import('./components/RepeatingTableRows')),
  Field: {
    Custom: Field,
    withComponent: asFormField,
    Range: RangeField,
    withRangeComponent: asRangeField,
    Date: asFormField(lazy(() => import('./components/inputs/DateInput'))),
    DateRange : asRangeField(lazy(() => import('./components/inputs/DateRangeInput'))),
    Markdown: asFormField(lazy(() => import('./components/inputs/MarkdownInput'))),
    Text: asFormField(lazy(() => import('./components/inputs/TextInput'))),
    Switch: asSelfLabeledFormField(Switch),
    // Repeating: RepeatingField,
  },
  selectWithType: <T>() => asFormField(Select.withType<T>()),
  autocompleteWithType: <T>() => asFormField(AutocompleteInput.withType<T>()),
  ...hookApi,
}

export function formFor<Data, AcceptedDroppableTypes = null>(): FormFor<Data, AcceptedDroppableTypes> {
  return form as FormFor<Data, AcceptedDroppableTypes>
}
