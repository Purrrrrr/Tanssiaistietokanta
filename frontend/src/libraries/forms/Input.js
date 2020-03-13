import React from 'react';
import {BasicInput} from './BasicInput';
import {withFormGroupWrapper} from "./withFormGroupWrapper";
import {Validate, stripValidationProps} from "./validation";

export const Input = withFormGroupWrapper(function Input(props) {
  return <>
    <BasicInput {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
});
