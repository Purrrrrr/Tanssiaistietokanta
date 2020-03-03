import React, {useContext} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {FormContext} from "./Form";

export function SubmitButton({disabled, ...props}) {
  const {isValid} = useContext(FormContext);
  
  return <Button type="submit" intent={Intent.PRIMARY} 
    disabled={!isValid || disabled} {...props} />;
}
