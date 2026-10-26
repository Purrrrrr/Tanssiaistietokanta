import React, { useEffect, useRef, useState } from 'react'

import { ConflictMap, OnFormChangeHandler } from './types'

import { FieldStyleContext, type FieldStyleContextProps } from '@/libraries/ui/form/containers/FieldStyleContext'

import { FormMetadataContext, FormMetadataContextType, FormValidityContext, useCreateFormMetadataContext } from './formContext'
import { FormStrings } from './strings'
import { useValidationResult } from './validation'

export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Partial<FieldStyleContextProps>,
  Pick<Partial<FormMetadataContextType<T>>, 'readOnly' | 'onResolveConflict'> {
  value: T
  onChange: OnFormChangeHandler<T>
  conflicts?: ConflictMap<T>
  onValidityChange?: (validity: { hasErrors: boolean }) => unknown
  onSubmit?: (t: T, e: React.FormEvent) => unknown
  strings?: FormStrings
  errorDisplay?: 'always' | 'onSubmit'
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
  labelStyle,
  inline,
  strings,
  errorDisplay = 'always',
  ...rest
}: FormProps<T>) {
  const { hasErrors, ValidationContainer } = useValidationResult()
  const form = useRef<HTMLFormElement>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (onValidityChange) onValidityChange({ hasErrors })
  }, [onValidityChange, hasErrors])

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    // Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    setHasSubmitted(true)
    if (hasErrors) return
    await onSubmit?.(value, e)
    // We reset the submitted state after onSubmit to hide errors again
    setHasSubmitted(false)
  }
  const showErrors = errorDisplay === 'always' || hasSubmitted

  const metadataContext = useCreateFormMetadataContext({ value, onChange, readOnly, conflicts, strings, onResolveConflict, showErrors })

  return <FormMetadataContext.Provider value={metadataContext as FormMetadataContextType<unknown>}>
    <FieldStyleContext inline={inline} labelStyle={labelStyle}>
      <FormValidityContext.Provider value={!hasErrors}>
        <ValidationContainer>
          <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
        </ValidationContainer>
      </FormValidityContext.Provider>
    </FieldStyleContext>
  </FormMetadataContext.Provider>
}
