import React from 'react'

import { PropertyAtPath, StringPath } from './types'

import { MarkdownInput, type MarkdownInputProps } from 'libraries/formsV2/components/inputs/MarkdownInput'

import { Field, UntypedFieldProps } from './Field'
import { InputField, InputFieldProps, SwitchField, SwitchFieldForValueProps, SwitchFieldProps, switchFor, SwitchForProps } from './fieldComponents/basicComponents'
import { Form, FormProps } from './Form'
import { RemoveItemButton, RemoveItemButtonProps } from './formControls'
import { FormHooksFor, formHooksFor } from './hooks'
import { Entity, ListField, UntypedListFieldProps } from './ListEditor'

export type MarkdownEditorProps = MarkdownInputProps
export const MarkdownEditor = MarkdownInput
export * from './fieldComponents/basicComponents'
export * from './fieldComponents/dateTime'
export { ActionButton, asFormControl, FormControl, SubmitButton } from './formControls'
export type { DragHandle } from './ListEditor'
export { ListEditorContext } from './ListEditor'
export * from './SyncStatus'
export type { FieldComponentProps, OnChangeHandler, TypedStringPath } from './types'
export { toArrayPath } from './types'
export * from './useAutosavingState'
export { Validate } from './validation'

interface FormFor<T> extends FormHooksFor<T> {
  Form: React.JSXElementConstructor<FormProps<T>>
  Field: <P extends StringPath<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(props: UntypedFieldProps<P, V, C, AP>) => React.ReactElement
  Switch: (props: SwitchFieldProps<T>) => React.ReactElement
  switchFor: <V>(props: SwitchForProps<V>) => (props: SwitchFieldForValueProps<T, V>) => React.ReactElement
  Input: (props: InputFieldProps<T>) => React.ReactElement
  ListField: <P extends StringPath<T>, V extends PropertyAtPath<T, P> & Entity[], Props = object>(props: UntypedListFieldProps<T, P, V[number], Props>) => React.ReactElement
  RemoveItemButton: (props: RemoveItemButtonProps<T>) => React.ReactElement
}

export function formFor<T>(): FormFor<T> {
  return {
    Form,
    Field: Field,
    Switch: SwitchField,
    switchFor,
    Input: InputField,
    RemoveItemButton,
    ListField,
    ...formHooksFor<T>(),
  } as FormFor<T>
}
