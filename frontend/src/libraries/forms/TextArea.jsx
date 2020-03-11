import React from 'react';
import {BasicTextArea} from './BasicTextArea';
import {Validate, stripValidationProps} from "./validation";

export function TextArea(props) {
  return <>
    <BasicTextArea {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
}
