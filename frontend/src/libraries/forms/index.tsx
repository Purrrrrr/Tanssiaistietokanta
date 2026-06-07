import React from 'react'

import { PropertyAtPath, StringPath } from './types'

import { Field, UntypedFieldProps } from './Field'
import { InputField, InputFieldProps, SwitchField, SwitchFieldForValueProps, SwitchFieldProps, switchFor, SwitchForProps } from './fieldComponents/basicComponents'
import { Form, FormProps } from './Form'
import { RemoveItemButton, RemoveItemButtonProps } from './formControls'
import { FormHooksFor, formHooksFor } from './hooks'
import { Entity, ListField, UntypedListFieldProps } from './ListEditor'

export {
  Input,
  InputField,
  type InputFieldProps,
  type InputProps,
  type NumberInputProps,
  RadioGroup,
  SwitchField,
  type SwitchFieldForValueProps,
  type SwitchFieldProps,
  switchFor,
  type SwitchForProps,
  TextArea,
} from './fieldComponents/basicComponents'
export {
  DateField,
  DateFieldInput,
  type DateFieldInputProps,
  type DateFieldProps,
  DateRangeField,
  type DateRangeFieldProps,
} from './fieldComponents/dateTime'
export { type FormProps } from './Form'
export { ActionButton, asFormControl, FormControl, SubmitButton } from './formControls'
export type { DragHandle } from './ListEditor'
export { ListEditorContext } from './ListEditor'
export { SyncStatus } from './SyncStatus'
export type { FieldComponentProps, OnChangeHandler, TypedStringPath } from './types'
export { toArrayPath } from './types'
export type * from './useAutosavingState'
export { patchStrategy, USE_BACKEND_VALUE, USE_LOCAL_VALUE, useAutosavingState } from './useAutosavingState'
export { Validate } from './validation'
export { NumberInput, Switch } from 'libraries/formsV2/components/inputs'

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
