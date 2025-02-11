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

import { type FieldInputComponent, SwitchInput, TextInput } from './components/inputs'
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
const Switch = asSelfLabeledFormField(SwitchInput)

type ExternalFieldProps<Data, Input, Output extends Input, Extra extends object> = FieldProps<Input, Output, Extra> & {
  path: FieldPath<Input, Output, Data>
}
type SpecializedFieldComponentFor<Data, Input, Output extends Input, Extra extends object> = (p: Omit<ExternalFieldProps<Data, Input, Output, Extra>, 'component'>) => React.ReactElement

type ExternalSelfLabeledFieldProps<Data, Input, Output extends Input, Extra extends object> = SelfLabeledFieldProps<Input, Output, Extra> & {
  path: FieldPath<Input, Output, Data>
}

interface FormFor<Data> {
  Field: <Input, Output extends Input, Extra extends object>(props: ExternalFieldProps<Data, Input, Output, Extra>) => React.ReactElement
  asFormField: <Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>) => SpecializedFieldComponentFor<Data, Input, Output, Extra>
  TextField: SpecializedFieldComponentFor<Data, string | undefined | null, string, object>
  Switch: (p: Omit<ExternalSelfLabeledFieldProps<Data, boolean | undefined | null, boolean, object>, 'component'>) => React.ReactElement
}

export function formFor<Data>(): FormFor<Data> {
  return {
    Field,
    asFormField,
    TextField,
    Switch,
  } as FormFor<Data>
}
