import React from 'react';
import {BasicTextArea} from './BasicTextArea';
import {withFormGroupWrapper} from "./withFormGroupWrapper";
import {Validate, stripValidationProps} from "./validation";

export const TextArea = withFormGroupWrapper(function TextArea(props) {
  return <>
    <BasicTextArea {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
});
