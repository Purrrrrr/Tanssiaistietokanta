import React, { useEffect, useMemo, useRef } from 'react'
import * as L from 'partial.lenses'

import { ArrayPath, ChangeListener } from './types'

import { FormMetadataContext, FormMetadataContextType, FormValidityContext } from './formContext'
import {useValidationResult} from './validation'

const defaultLabelStyle = 'above'

export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Omit<Partial<FormMetadataContextType<T>>, 'onChange'>,
  Pick<FormMetadataContextType<T>, 'onChange'>
{
  value: T
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
  const listeners = useMemo(() => new Set<ChangeListener>(), [])
  const valueRef = useRef<T>()
  valueRef.current = value
  const conflictsRef = useRef<ArrayPath<T>>()
  conflictsRef.current = conflicts as any

  const metadataContext = useMemo(
    () => {
      const onChangePath = (path, newValue) => {
        const val = valueRef.current
        valueRef.current = typeof newValue  === 'function'
          ? L.modify(path, newValue, val)
          : L.set(path, newValue, val)

        onChange(valueRef.current as T)
      }
      return {
        getValue: () => valueRef.current,
        getConflicts: () => conflictsRef.current ?? [],
        subscribeToChanges: (listener: ChangeListener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        readOnly, labelStyle, inline,
        onChange: (value) => onChangePath([], value),
        onChangePath,
      }
    }, [readOnly, labelStyle, inline, onChange, listeners]
  )

  useEffect(() => listeners.forEach(l => l()), [listeners, value])

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit && onSubmit(value, e)
  }

  return <FormMetadataContext.Provider value={metadataContext as FormMetadataContextType<unknown>}>
    <FormValidityContext.Provider value={!hasErrors}>
      <ValidationContainer>
        <form {...rest} onSubmit={submitHandler} ref={form}>{children}</form>
      </ValidationContainer>
    </FormValidityContext.Provider>
  </FormMetadataContext.Provider>
}
