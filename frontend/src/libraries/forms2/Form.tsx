import React, { useMemo, useRef } from 'react';
import * as L from 'partial.lenses';
import { FormValueContext, FormValueContextType, FormMetadataContext, FormMetadataContextType } from './formContext'
import {useValidationResult} from './validation';

const defaultLabelStyle = 'above'

export interface FormProps<T> extends 
  Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit" | "onChange">,
  Omit<FormValueContextType<T>, "conflicts" | "formIsValid">,
  Omit<Partial<FormMetadataContextType<T>>, "onChange">,
  Pick<FormMetadataContextType<T>, "onChange">
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
  const valueRef = useRef<T>();
  valueRef.current = value

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return;
    e.preventDefault();
    onSubmit && onSubmit(value, e);
  }

  const valueContext = useMemo(() => {
    return {
      value,
      conflicts,
      formIsValid: !hasErrors
    }
  }, [value, conflicts, hasErrors])
  const metadataContext = useMemo(
    () => {
      const onChangePath = (path, newValue) => {
        const val = valueRef.current!
        valueRef.current = typeof newValue  === 'function'
        ? L.modify(path, newValue, val)
        : L.set(path, newValue, val)

        onChange(valueRef.current!)
      }
      return {
        readOnly, labelStyle, inline,
        onChange: (value) => onChangePath([], value),
        onChangePath,
      }
    }, [readOnly, labelStyle, inline, onChange]
  )

  return <FormValueContext.Provider value={valueContext as unknown as FormValueContextType<unknown>}>
    <FormMetadataContext.Provider value={metadataContext}>
      <ValidationContainer>
        <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
      </ValidationContainer>
    </FormMetadataContext.Provider>
  </FormValueContext.Provider>
}
