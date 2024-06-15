import React, { useEffect, useRef } from 'react'

import { ConflictMap, OnChangeHandler } from './types'

import { FormMetadataContext, FormMetadataContextType, FormValidityContext, useCreateFormMetadataContext} from './formContext'
import { FormStrings } from './strings'
import {useValidationResult} from './validation'

const defaultLabelStyle = 'above'

export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Pick<Partial<FormMetadataContextType<T>>, 'readOnly' | 'inline' | 'labelStyle' | 'onResolveConflict'>
{
  value: T
  onChange: OnChangeHandler<T>
  conflicts?: ConflictMap<T>
  onValidityChange?: (validity: {hasErrors: boolean}) => unknown
  onSubmit?: (t: T, e: React.FormEvent) => unknown
  strings?: FormStrings
}

const noOp = () => { /* no op */ }

export function Form<T>({
  children,
  value,
  conflicts,
  onChange,
  onResolveConflict = noOp,
  onSubmit,
  onValidityChange,
  readOnly = false,
  labelStyle = defaultLabelStyle,
  inline = false,
  strings,
  ...rest
} : FormProps<T>) {
  const {hasErrors, ValidationContainer} = useValidationResult()
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (onValidityChange) onValidityChange({hasErrors})
  }, [onValidityChange, hasErrors])

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit && onSubmit(value, e)
  }

  const metadataContext = useCreateFormMetadataContext({value, onChange, labelStyle, inline, readOnly, conflicts, strings, onResolveConflict})

  return <FormMetadataContext.Provider value={metadataContext as FormMetadataContextType<unknown>}>
    <FormValidityContext.Provider value={!hasErrors}>
      <ValidationContainer>
        <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
      </ValidationContainer>
    </FormValidityContext.Provider>
  </FormMetadataContext.Provider>
}
