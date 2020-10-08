import React, {createContext, useRef, useCallback} from 'react';
import {useValidationResult} from './validation';

export const FormContext = createContext({
  isValid: true
});

export function Form({children, onSubmit, ...rest}) {
  const {hasErrors, ValidationContainer} = useValidationResult();
  const form = useRef<HTMLFormElement>(null);
  const context = {
    isValid: !hasErrors
  };

  const submitHandler = useCallback(
    (e) => {
      //Sometimes forms from dialogs end up propagating into our form and we should not submit then
      if (e.target !== form.current) return;
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit]
  )
  
  return <FormContext.Provider value={context}>
    <ValidationContainer>
      <form {...rest} onSubmit={submitHandler} ref={form} >{children}</form>
    </ValidationContainer>
  </FormContext.Provider>;
}
