import { useEffect, useRef } from 'react'

import { PathFor } from './types'

import { FieldStyleContext } from './components/FieldContainer/context'
import { FieldStyleContextProps } from './components/FieldContainer/types'
import { FormContext, useFormContextValue } from './context'
import { subscribe, unsubscribe, useFormReducer } from './reducer'


interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Partial<FieldStyleContextProps>
{
  value: T
  onChange: (t: T, Path: PathFor<T>) => unknown
  onSubmit?: (t: T, e: React.FormEvent) => unknown
}

export function Form<T>({
  value, onChange, onSubmit, labelStyle, inline, children, ...rest
}: FormProps<T>) {
  const form = useRef<HTMLFormElement>(null)
  const [state, dispatch] = useFormReducer(value)

  useEffect(
    () => {
      dispatch(subscribe('', onChange))
      return () => dispatch(unsubscribe('', onChange))
    },
    [dispatch, onChange]
  )
  const ctx = useFormContextValue(state, dispatch)

  const submitHandler = (e: React.FormEvent) => {
    //Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    onSubmit && onSubmit(state.data, e)
  }

  return <form onSubmit={submitHandler} {...rest} ref={form}>
    <FieldStyleContext inline={inline} labelStyle={labelStyle}>
      <FormContext.Provider value={ctx}>
        {children}
      </FormContext.Provider>
    </FieldStyleContext>
  </form>
}
