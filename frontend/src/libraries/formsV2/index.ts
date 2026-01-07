import { type ComponentType, lazy, type ReactElement } from 'react'

import { type ListItem } from './components/dnd'
import { asFormField, Field, type FieldComponent, type FieldProps } from './components/Field'
import { Form, type FormProps } from './components/Form'
import type { AutocompleteInputProps, DateInputProps, DateRangeInputProps, FieldInputComponent, FieldInputComponentProps, MarkdownInputProps, SelectProps, SwitchProps, TextInputExtraProps } from './components/inputs'
import { AutocompleteInput, DateInput, DateRangeInput, MarkdownInput, Select, Switch, TextInput } from './components/inputs'
import { asRangeField, type Range, RangeField, type RangeFieldComponent, type RangeFieldProps } from './components/RangeField'
import { type RepeatingSectionProps } from './components/RepeatingSection'
import { asSelfLabeledFormField, type SelfLabeledFieldComponent } from './components/SelflabeledField'
import hookApi, { type HooksFor } from './hooks/externalHookApi'

export { withDefaults } from './utils/withDefaults'
export type { FieldInputComponentProps }

interface FormFor<Data, AcceptedDroppableTypes = null> extends HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
  Field: FieldsFor<Data, AcceptedDroppableTypes>
  selectWithType: <T>() => FieldComponent<Data, T, SelectProps<T>, T>
  autocompleteWithType: <T>() => FieldComponent<Data, T, AutocompleteInputProps<T>, T>
  RepeatingSection: <O extends ListItem>(t: RepeatingSectionProps<O, Data, AcceptedDroppableTypes>) => ReactElement
}

interface FieldsFor<Data, _AcceptedDroppableTypes = null> {
  Custom: <Output extends Input, Extra, Input>(props: FieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  Range: <Output extends Input, Extra, Input>(props: RangeFieldProps<Output, Extra, Input, Data>) => React.ReactElement
  withRangeComponent: <Output extends Input, Extra, Input>(c: FieldInputComponent<Range<Output>, Extra, Range<Input>>) => RangeFieldComponent<Data, Output, Extra, Input>
  Date: FieldComponent<Data, Date | null, DateInputProps>
  DateRange: RangeFieldComponent<Data, Date | null, DateRangeInputProps>
  Markdown: FieldComponent<Data, string, MarkdownInputProps>
  Text: FieldComponent<Data, string, TextInputExtraProps>
  Switch: SelfLabeledFieldComponent<Data, boolean, SwitchProps>
  // Repeating: <O extends I & ListItem, E, I>(t: RepeatingFieldProps<O, E, I, Data, AcceptedDroppableTypes>) => ReactElement
}

/*

{
  Form,
  RepeatingSection,
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
  Field: {
    Custom: Field,
    withComponent: asFormField,
    Range: RangeField,
    withRangeComponent: asRangeField,
    Date: asFormField(DateInput),
    DateRange: asRangeField(DateRangeInput),
    Markdown: asFormField(MarkdownInput),
    Text: asFormField(TextInput),
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
