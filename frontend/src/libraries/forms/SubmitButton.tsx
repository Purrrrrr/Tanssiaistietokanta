import React, {useContext} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {FormContext} from "./Form";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : SubmitButtonProps) {
  const {isValid} = useContext(FormContext);
  
  return <Button type="submit" intent={Intent.PRIMARY} 
    disabled={!isValid || disabled} {...props} />;
}
