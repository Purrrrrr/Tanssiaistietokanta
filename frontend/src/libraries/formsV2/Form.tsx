import { useEffect, useRef } from 'react'

import { type FieldStyleContextProps, FieldStyleContext } from './components/FieldContainer'
import { type FormStateContext, FormContext, useFormContextValue } from './context'
import { useFormReducer } from './reducer'


export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Partial<FieldStyleContextProps>
{
  readOnly?: boolean
  value: T
  onChange: (t: T) => unknown
  onSubmit?: (t: T, e: React.FormEvent) => unknown
  onIsValidChange?: (isValid: boolean) => unknown
}

export function Form<T>({
  value, onChange, onSubmit, onIsValidChange, labelStyle, inline, children, readOnly = false, ...rest
}: FormProps<T>) {
  const form = useRef<HTMLFormElement>(null)
  const reducerData = useFormReducer(value)
  const { state } = reducerData

  useEffect(
    () => { onChange(state.data) },
    [onChange, state.data]
  )
  useEffect(
    () => { onIsValidChange?.(state.isValid) },
    [onIsValidChange, state.isValid]
  )
  const ctx = useFormContextValue(reducerData, readOnly)

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit && onSubmit(state.data, e)
  }

  return <form onSubmit={submitHandler} {...rest} ref={form}>
    <FieldStyleContext inline={inline} labelStyle={labelStyle}>
      <FormContext.Provider value={ctx as FormStateContext<unknown>}>
        {children}
      </FormContext.Provider>
    </FieldStyleContext>
  </form>
}
