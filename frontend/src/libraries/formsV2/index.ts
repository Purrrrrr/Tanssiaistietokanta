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

import { type FieldInputComponent, TextInput } from './components/inputs'
import { type FieldProps, Field } from './Field'
import type { FieldPath } from './types'
import { withComponent } from './utils/withInputComponent'

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

const TextField = withComponent(TextInput)

type ExternalFieldProps<Data, Input, Output extends Input, Extra extends object> = FieldProps<Input, Output, Extra> & {
  path: FieldPath<Input, Output, Data>
}
type SpecializedFieldComponentFor<Data, Input, Output extends Input, Extra extends object> = (p: Omit<ExternalFieldProps<Data, Input, Output, Extra>, 'component'>) => React.ReactElement

interface FormFor<Data> {
  Field: <Input, Output extends Input, Extra extends object>(props: ExternalFieldProps<Data, Input, Output, Extra>) => React.ReactElement
  withComponent: <Input, Output extends Input, Extra extends object>(c: FieldInputComponent<Input, Output, Extra>) => SpecializedFieldComponentFor<Data, Input, Output, Extra>
  TextField: SpecializedFieldComponentFor<Data, string | undefined | null, string, object>
}

export function formFor<Data>(): FormFor<Data> {
  return {
    Field,
    withComponent,
    TextField: TextField
  } as FormFor<Data>
}
