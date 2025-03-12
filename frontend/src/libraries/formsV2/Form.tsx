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

export function Form<T>(props: FormProps<T>) {
  const {
    onSubmit, labelStyle, inline, children, ...rest
  } = props
  const { context, formProps } = useForm(rest)

  const form = useRef<HTMLFormElement>(null)
  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit?.(context.getState().data, e)
  }

  return <form {...formProps} onSubmit={submitHandler} ref={form}>
    <FieldStyleContext inline={inline} labelStyle={labelStyle}>
      <FormContext.Provider value={context as FormStateContext<unknown>}>
        {children}
      </FormContext.Provider>
    </FieldStyleContext>
  </form>
}

function useForm<T>(props: FormProps<T>) {
  const {
    value, onChange, onIsValidChange, readOnly = false, ...rest
  } = props
  const reducerData = useFormReducer(value, onChange)
  const { state } = reducerData

  useEffect(
    () => { onIsValidChange?.(state.validation.isValid) },
    [onIsValidChange, state.validation.isValid]
  )
  const context = useFormContextValue(reducerData, readOnly)

  return {
    context, formProps: rest
  }
}
