import React from 'react';
import {useValueAt, useOnChangeFor} from './formContext'
import {TypedPath, Path, PropertyAtPath, NewValue} from './types'
import {Field, FieldProps} from './Field'
import {Form, FormProps} from './Form'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents'

export * from './fieldComponents'
export * from './formControls'
export * from './MarkdownEditor'
export * from './closableEditors'
export type { FieldComponentProps } from './types'
export {Validate} from './validation';

interface FormFor<T> {
  Form: React.JSXElementConstructor<FormProps<T>>
  Field: <L, P extends Path<T>, V extends PropertyAtPath<T,P>, C extends React.ElementType, AP>(props: FieldProps<L,P,V,C,AP>) => React.ReactElement
  Switch: <L, P extends TypedPath<T,P,boolean>, V extends PropertyAtPath<T,P> & boolean>(props: SwitchFieldProps<L,P,V>) => React.ReactElement
  Input: <L, P extends TypedPath<T,P,string | undefined>, V extends PropertyAtPath<T,P> & (string | undefined)>(props: InputFieldProps<L,P,V>) => React.ReactElement
  useValueAt: <P extends Path<T>, SubT extends PropertyAtPath<T,P>>(path: P) => SubT
  useOnChangeFor: <P extends Path<T>, SubT extends PropertyAtPath<T,P>>(path: P) => (v: NewValue<SubT>) => unknown
}

export function formFor<T>(): FormFor<T> {
  return {
    Form,
    Field,
    Switch: SwitchField,
    Input: InputField,
    useValueAt,
    useOnChangeFor,
  } as FormFor<T>
}
