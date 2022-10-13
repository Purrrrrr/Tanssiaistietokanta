import React from 'react';
import {Button} from "libraries/ui";
import {useFormValue} from "./formContext";

export * from './Field'
export * from './Form'
export * from './fieldComponents'
export type { FieldComponentProps } from './types'
export {Validate} from '../forms/validation';

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : SubmitButtonProps) {
  const {formIsValid} = useFormValue();
  return <Button type="submit" intent="primary" 
    disabled={!formIsValid || disabled} {...props} />;
}
