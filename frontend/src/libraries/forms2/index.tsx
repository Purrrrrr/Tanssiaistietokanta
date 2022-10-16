import React from 'react';
import {Button} from "libraries/ui";
import {useFormValueContext, useFormMetadata, useValueAt, useOnChangeFor} from './formContext'
import {TypedPath, Path, PropertyAtPath, NewValue} from './types'
import {Field, FieldProps} from './Field'
import {Form, FormProps} from './Form'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents'

export * from './fieldComponents'
export type { FieldComponentProps } from './types'
export {Validate} from './validation';

type ButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : ButtonProps) {
  const {formIsValid} = useFormValueContext();
  const {readOnly} = useFormMetadata();
  if (readOnly) return null
  return <ActionButton type="submit" intent="primary" 
    disabled={!formIsValid || disabled} {...props} />;
}
export function ActionButton(props : ButtonProps) {
  return <FormControl><Button {...props} /></FormControl>;
}
export function FormControl({children}) {
  const {readOnly} = useFormMetadata();
  if (readOnly) return null
  
  return children
}
export function asFormControl<T>(Component: React.ComponentType<T>) {
  return (props: T) => <FormControl><Component {...props as any} /></FormControl>
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
