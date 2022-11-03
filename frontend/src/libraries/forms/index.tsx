import React  from 'react'

import {PropertyAtPath, StringPath, TypedStringPath} from './types'

import {Field, FieldProps} from './Field'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents'
import {Form, FormProps} from './Form'
import {FormHooksFor, formHooksFor} from './hooks'

export * from './closableEditors'
export * from './fieldComponents'
export * from './formControls'
export * from './ListEditor'
export * from './MarkdownEditor'
export * from './Selector'
export * from './SyncStatus'
export type { FieldComponentProps, TypedStringPath } from './types'
export { toArrayPath } from './types'
export * from './useAutosavingState'
export {Validate} from './validation'

interface FormFor<T> extends FormHooksFor<T> {
  Form: React.JSXElementConstructor<FormProps<T>>
  Field: <P extends StringPath<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(props: FieldProps<P, V, C, AP>) => React.ReactElement
  Switch: <P extends TypedStringPath<boolean, T>, V extends PropertyAtPath<T, P> & boolean>(props: SwitchFieldProps<P, V>) => React.ReactElement
  Input: <P extends TypedStringPath<string, T>, V extends PropertyAtPath<T, P> & (string | undefined | null)>(props: InputFieldProps<P, V>) => React.ReactElement
}

export function formFor<T>(): FormFor<T> {
  return {
    Form,
    Field,
    Switch: SwitchField,
    Input: InputField,
    ...formHooksFor<T>(),
  } as FormFor<T>
}
