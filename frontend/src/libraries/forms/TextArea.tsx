import React from 'react';
import {BasicTextArea} from './BasicTextArea';
import {withFormGroupWrapper} from "./withFormGroupWrapper";
import {Validate, stripValidationProps, ValidationProps} from "./validation";

export const TextArea = withFormGroupWrapper<React.ComponentProps<typeof BasicTextArea> & ValidationProps>(function TextArea(props) {
  return <>
    <BasicTextArea {...stripValidationProps(props)} />
    <Validate {...props} />
  </>
});
