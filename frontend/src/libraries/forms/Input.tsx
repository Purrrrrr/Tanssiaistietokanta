import React from 'react';
import {BasicInput} from './BasicInput';
import {withFormGroupWrapper} from "./withFormGroupWrapper";
import {Validate, stripValidationProps, ValidationProps} from "./validation";

export const Input = withFormGroupWrapper<React.ComponentProps<typeof BasicInput> & ValidationProps>(function Input(props) {
  return <>
    <BasicInput {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
});
