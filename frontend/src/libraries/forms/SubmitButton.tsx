import React, {useContext} from 'react';
import {Button} from "libraries/ui";
import {FormContext} from "./Form";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : SubmitButtonProps) {
  const {isValid} = useContext(FormContext);
  
  return <Button type="submit" intent="primary" 
    disabled={!isValid || disabled} {...props} />;
}

