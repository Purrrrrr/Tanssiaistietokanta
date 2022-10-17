import React from 'react';
import {Button} from "libraries/ui";
import {useFormValueContext, useFormMetadata} from './formContext'

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