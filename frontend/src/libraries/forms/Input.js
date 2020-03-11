import React from 'react';
import {BasicInput} from './BasicInput';
import {Validate, stripValidationProps} from "./validation";

export function Input(props) {
  return <>
    <BasicInput {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
}
