import React, {createContext, useCallback} from 'react';
import {useValidationResult} from './validation';

export const FormContext = createContext({
  isValid: true
});

export function Form({children, onSubmit}) {
  const {hasErrors, ValidationContainer} = useValidationResult();
  const context = {
    isValid: !hasErrors
  };

  const submitHandler = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit]
  )
  
  return <FormContext.Provider value={context}>
    <ValidationContainer>
      <form onSubmit={submitHandler}>{children}</form>
    </ValidationContainer>
  </FormContext.Provider>;
}
