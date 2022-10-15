import React from 'react';
import {Button} from "libraries/ui";
import {useFormValueContext} from "./formContext";
import {TypedPath, Path, PropertyAtPath, NewValue} from './types'

import {Field, FieldProps} from './Field'
import {Form, FormProps} from './Form'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents'
import {useValueAt, useOnChangeFor} from './formContext'

export * from './fieldComponents'
export type { FieldComponentProps } from './types'
export {Validate} from './validation';

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : SubmitButtonProps) {
  const {formIsValid} = useFormValueContext();
  return <Button type="submit" intent="primary" 
    disabled={!formIsValid || disabled} {...props} />;
}

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
