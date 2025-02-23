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

import { type ComponentProps } from 'react'

import { type FieldInputComponent, MarkdownInput, Nullable, SwitchInput, TextInput } from './components/inputs'
import { MarkdownEditorProps } from './components/inputs/MarkdownInput'
import { SwitchProps } from './components/inputs/SwitchInput'
import { type FieldProps, type SelfLabeledFieldProps, Field } from './Field'
import type { FieldPath } from './types'
import { asFormField, asSelfLabeledFormField } from './utils/asFormField'

export { TextInput }

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

const TextField = asFormField(TextInput)
const MarkdownField = asFormField(MarkdownInput)
const Switch = asSelfLabeledFormField(SwitchInput)

type ExternalFieldProps<Data, Output extends Input, Extra, Input> = FieldProps<Output, Extra, Input> & {
  path: FieldPath<Input, Output, Data>
}

type SpecializedFieldComponentFor<Data, Output extends Input, Extra, Input = Nullable<Output>> = (p: Omit<ExternalFieldProps<Data, Output, Extra, Input>, 'component'>) => React.ReactElement

type ExternalSelfLabeledFieldProps<Data, Output extends Input, Extra, Input = Nullable<Output>> = SelfLabeledFieldProps<Output, Extra, Input> & {
  path: FieldPath<Input, Output, Data>
}

interface FormFor<Data> {
  Field: <Output extends Input, Extra, Input>(props: ExternalFieldProps<Data, Output, Extra, Input>) => React.ReactElement
  asFormField: <Output extends Input, Extra, Input>(c: FieldInputComponent<Output, Extra, Input>) => SpecializedFieldComponentFor<Data, Output, Extra, Input>
  MarkdownField: SpecializedFieldComponentFor<Data, string, MarkdownEditorProps>
  TextField: SpecializedFieldComponentFor<Data, string, ComponentProps<'input'>>
  Switch: (p: Omit<ExternalSelfLabeledFieldProps<Data, boolean, SwitchProps>, 'component'>) => React.ReactElement
}

export function formFor<Data>(): FormFor<Data> {
  return {
    Field,
    asFormField,
    MarkdownField,
    TextField,
    Switch,
  } as FormFor<Data>
}
