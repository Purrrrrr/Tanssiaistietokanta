import React, { useRef } from 'react'

import { ArrayPath, OnChangeHandler } from './types'

import { FormMetadataContext, FormMetadataContextType, FormValidityContext, useCreateFormMetadataContext} from './formContext'
import {useValidationResult} from './validation'

const defaultLabelStyle = 'above'

export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Omit<Partial<FormMetadataContextType<T>>, 'onChange'>
{
  value: T
  onChange: OnChangeHandler<T>
  conflicts?: ArrayPath<T>[]
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
  const {hasErrors, ValidationContainer} = useValidationResult()
  const form = useRef<HTMLFormElement>(null)

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit && onSubmit(value, e)
  }

  const metadataContext = useCreateFormMetadataContext({value, onChange, labelStyle, inline, readOnly, conflicts})

  return <FormMetadataContext.Provider value={metadataContext}>
    <FormValidityContext.Provider value={!hasErrors}>
      <ValidationContainer>
        <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
      </ValidationContainer>
    </FormValidityContext.Provider>
  </FormMetadataContext.Provider>
}
