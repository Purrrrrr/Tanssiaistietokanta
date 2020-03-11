import React from 'react';
import {BasicTextArea} from './BasicTextArea';
import {Validate} from "./validation";

export function TextArea(props) {
  return <>
    <BasicTextArea {...props} />
    <Validate {...props} />
  </>
}
