import React from 'react';
import {BasicInput} from './BasicInput';
import {Validate} from "./validation";

export function Input(props) {
  return <>
    <BasicInput {...props} />
    <Validate {...props} />
  </>
}
