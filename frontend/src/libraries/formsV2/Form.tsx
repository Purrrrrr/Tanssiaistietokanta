import { useEffect, useRef } from 'react'

import { FieldStyleContext } from './components/FieldContainer/context'
import { FieldStyleContextProps } from './components/FieldContainer/types'
import { type FormStateContext, FormContext, useFormContextValue } from './context'
import { useFormReducer } from './reducer'


interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Partial<FieldStyleContextProps>
{
  value: T
  onChange: (t: T) => unknown
  onSubmit?: (t: T, e: React.FormEvent) => unknown
}

export function Form<T>({
  value, onChange, onSubmit, labelStyle, inline, children, ...rest
}: FormProps<T>) {
  const form = useRef<HTMLFormElement>(null)
  const { state, dispatch, subscribe } = useFormReducer(value)

  useEffect(
    () => subscribe(state => onChange(state.data)),
    [subscribe, onChange]
  )
  const ctx = useFormContextValue(state, dispatch, subscribe)

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
