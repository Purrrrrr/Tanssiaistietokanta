import { useEffect, useRef } from 'react'

import { ErrorDisplay } from '../../types'
import { type FieldStyleContextProps } from '../containers/types'

import { FormContext, type FormStateContext, useFormContextValue } from '../../context'
import { useFormReducer } from '../../reducer'
import { FieldStyleContext } from '../containers/context'
import { DndContext } from '../dnd/context'

export interface FormProps<T> extends
  Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit' | 'onChange'>,
  Partial<FieldStyleContextProps> {
  readOnly?: boolean
  errorDisplay?: ErrorDisplay
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
    // Sometimes forms from dialogs end up propagating into our form and we should not submit then
    if (e.target !== form.current) return
    e.preventDefault()
    context.dispatch({ type: 'FORM_SUBMIT' })
    if (!context.getState().validation.isValid) return
    onSubmit?.(context.getState().data, e)
  }

  return <form {...formProps} onSubmit={submitHandler} ref={form}>
    <FieldStyleContext inline={inline} labelStyle={labelStyle}>
      <FormContext.Provider value={context as FormStateContext<unknown>}>
        <DndContext>
          {children}
        </DndContext>
      </FormContext.Provider>
    </FieldStyleContext>
  </form>
}

function useForm<T>(props: FormProps<T>) {
  const {
    value, onChange, onIsValidChange, readOnly = false, errorDisplay = 'always', ...rest
  } = props
  const reducerData = useFormReducer(value, onChange)
  const { state } = reducerData

  useEffect(
    () => { onIsValidChange?.(state.validation.isValid) },
    [onIsValidChange, state.validation.isValid],
  )
  const context = useFormContextValue(reducerData, readOnly, errorDisplay)

  return {
    context, formProps: rest,
  }
}
