import React  from 'react'

import {PropertyAtPath, StringPath, TypedStringPath} from './types'

import {Field, FieldProps} from './Field'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents/basicComponents'
import {Form, FormProps} from './Form'
import {RemoveItemButton, RemoveItemButtonProps} from './formControls'
import {FormHooksFor, formHooksFor} from './hooks'
import {DragHandle, ListEditor, ListEditorItems, ListEditorItemsProps, ListEditorProps} from './ListEditor'

export * from './fieldComponents/basicComponents'
export * from './fieldComponents/closableEditors'
export * from './fieldComponents/MarkdownEditor'
export * from './fieldComponents/Selector'
export {ActionButton, asFormControl, FormControl, SubmitButton} from './formControls'
export * from './SyncStatus'
export type { FieldComponentProps } from './types'
export { toArrayPath } from './types'
export * from './useAutosavingState'
export {Validate} from './validation'

interface FormFor<T> extends FormHooksFor<T> {
  Form: React.JSXElementConstructor<FormProps<T>>
  Field: <P extends StringPath<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(props: FieldProps<P, V, C, AP>) => React.ReactElement
  Switch: <P extends TypedStringPath<boolean, T>, V extends PropertyAtPath<T, P> & boolean>(props: SwitchFieldProps<P, V>) => React.ReactElement
  Input: <P extends TypedStringPath<string, T>, V extends PropertyAtPath<T, P> & (string | undefined | null)>(props: InputFieldProps<P, V>) => React.ReactElement
  ListEditor: (props: ListEditorProps<T>) => React.ReactElement
  ListEditorItems: (props: ListEditorItemsProps<T>) => React.ReactElement
  DragHandle: typeof DragHandle
  RemoveItemButton: (props: RemoveItemButtonProps<T>) => React.ReactElement
}

export function formFor<T>(): FormFor<T> {
  return {
    Form,
    Field,
    Switch: SwitchField,
    Input: InputField,
    RemoveItemButton,
    ListEditor,
    ListEditorItems,
    DragHandle,
    ...formHooksFor<T>(),
  } as FormFor<T>
}
