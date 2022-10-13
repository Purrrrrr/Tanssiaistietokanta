import React, { useMemo, useRef } from 'react';
import { FormValueContext, FormValueContextType, FormMetadataContext, FormMetadataContextType } from './formContext'
import {useValidationResult} from '../forms/validation';

const defaultLabelStyle = 'above'

interface FormProps<T> extends 
  Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit" | "onChange">,
  Omit<FormValueContextType<T>, "conflicts" | "formIsValid">,
  Partial<FormMetadataContextType>
{
  conflicts?: FormValueContextType<T>["conflicts"] 
  inline?: boolean
  onSubmit?: (t: T, e: React.FormEvent) => unknown
}

export function Form<T>({
  children,
  value,
  conflicts = [],
  onChange,
  onSubmit,
  readOnly = false,
  labelStyle = defaultLabelStyle,
  inline = false,
  ...rest
} : FormProps<T>) {
  const {hasErrors, ValidationContainer} = useValidationResult();
  const form = useRef<HTMLFormElement>(null);

  const submitHandler = (e) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return;
    e.preventDefault();
    onSubmit && onSubmit(value, e);
  }
  const valueContext = useMemo(() => ({value, onChange, conflicts, formIsValid: !hasErrors}), [value, onChange, conflicts, hasErrors])
  const metadataContext = useMemo(() => ({readOnly, labelStyle, inline}), [readOnly, labelStyle, inline])

  return <FormValueContext.Provider value={valueContext as unknown as FormValueContextType<unknown>}>
    <FormMetadataContext.Provider value={metadataContext}>
      <ValidationContainer>
        <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
      </ValidationContainer>
    </FormMetadataContext.Provider>
  </FormValueContext.Provider>
}
