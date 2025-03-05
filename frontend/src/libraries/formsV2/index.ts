/* Need to export:
ActionButton as Button
ClickToEdit
ClickToEditMarkdown
DateField
DateRangeField
DragHandle
FieldComponentProps
formFor
Input
InputProps
ListEditorContext
MarkdownEditor
MenuButton
NumberInput
patchStrategy
PatchStrategy
RadioGroup
Selector
SelectorMenu
SubmitButton
Switch
SyncState
SyncStatus
TextArea
TypedStringPath
useAutosavingState
UseAutosavingStateReturn
*/

import { type ComponentProps, type ComponentType } from 'react'

import type { FieldPath, Labelable, ValueAt } from './types'

import { type FieldInputComponent, type FieldInputComponentProps, MarkdownInput, Nullable, SwitchInput, TextInput } from './components/inputs'
import { SwitchProps } from './components/inputs/SwitchInput'
import { type FieldProps, type SelfLabeledFieldProps, Field } from './Field'
import { type FormProps, Form } from './Form'
import { useApplyAt, useChangeAt, useValueAt } from './hooks'
import { asFormField, asSelfLabeledFormField } from './utils/asFormField'

export { TextInput }
export type { FieldInputComponentProps }

const TextField = asFormField(TextInput)
const MarkdownField = asFormField(MarkdownInput)
const Switch = asSelfLabeledFormField(SwitchInput)

type ExternalFieldProps<Data, Output extends Input, Extra, Input> = FieldProps<Output, Extra, Input> & {
  path: FieldPath<Input, Output, Data>
}

type FieldComponent<Data, Output extends Input, Extra, Input = Nullable<Output>> = (p: Omit<ExternalFieldProps<Data, Output, Extra, Input>, 'component'>) => React.ReactElement

type FieldComponentFor<Data, Component> = Component extends ComponentType<infer Props>
  ? Props extends FieldInputComponentProps<infer Output, infer Input>
    ? FieldComponent<Data, Output, ComponentProps<Component>, Input>
    : 0
  : 1

type ExternalSelfLabeledFieldProps<Data, Output extends Input, Extra extends Labelable, Input = Nullable<Output>> = SelfLabeledFieldProps<Output, Extra, Input> & {
  path: FieldPath<Input, Output, Data>
}

interface FormFor<Data> extends FieldsFor<Data>, HooksFor<Data> {
  Form: ComponentType<FormProps<Data>>
}

interface FieldsFor<Data> {
  Field: <Output extends Input, Extra, Input>(props: ExternalFieldProps<Data, Output, Extra, Input>) => React.ReactElement
  asFormField: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => FieldComponent<Data, Output, Extra, Input>
  MarkdownField: FieldComponentFor<Data, typeof MarkdownInput>
  TextField: FieldComponentFor<Data, typeof TextInput>
  Switch: (p: Omit<ExternalSelfLabeledFieldProps<Data, boolean, SwitchProps>, 'component'>) => React.ReactElement
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
