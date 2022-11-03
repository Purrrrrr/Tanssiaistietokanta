import React, {ComponentProps} from 'react'
import {Classes, Switch as BlueprintSwitch, TextArea as BlueprintTextArea, TextAreaProps as BlueprintTextAreaProps} from '@blueprintjs/core'
import classNames from 'classnames'

import {FieldComponentProps, PropertyAtPath, TypedStringPath} from './types'

import {Field, FieldProps} from './Field'

type AdditionalPropsFrom<Props> = Omit<Props, keyof FieldComponentProps<unknown>>

export type SwitchFieldProps<P, V> = Omit<FieldProps<P, V, typeof Switch, {label: string, inline?: boolean}>, 'componentProps' | 'component' | 'labelStyle'>

export function SwitchField<T, P extends TypedStringPath<boolean, T>, V extends PropertyAtPath<T, P> & boolean>(
  {label, ...props} : SwitchFieldProps<P, V>
) {
  // eslint-disable-next-line
  // @ts-ignore
  return <Field<T, P, V, typeof Switch, ExtraSwitchProps> {...props} label={label} labelStyle="hidden" component={Switch as any} componentProps={{label}} />
}

interface SwitchProps extends FieldComponentProps<boolean, HTMLInputElement>, ExtraSwitchProps { }
interface ExtraSwitchProps {
  label: string
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ value, onChange, readOnly, hasConflict, ...props }, ref) {
    return <BlueprintSwitch
      inputRef={ref}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked, e)}
      disabled={readOnly}
      {...props}
    />
  }
)

export type InputFieldProps<P, V>  = Omit<FieldProps<P, V, typeof Input, unknown>, 'component'>
export function InputField<T, P extends TypedStringPath<string, T>, V extends PropertyAtPath<T, P> & string >(
  props : InputFieldProps<P, V>
) {
  // eslint-disable-next-line
  // @ts-ignore
  return <Field<T, P, V, typeof Input, AdditionalPropsFrom<ComponentProps<'input'>>> {...props} component={Input as any} />
}

export interface InputProps extends FieldComponentProps<string, HTMLInputElement>, AdditionalPropsFrom<ComponentProps<'input'>> {
  inline?: boolean
  inputRef?: React.Ref<HTMLInputElement>
}
export function Input({value, className, onChange, inline, hasConflict, inputRef, ...props} : InputProps) {
  return <input
    ref={inputRef}
    value={value ?? ''}
    className={classNames(className, Classes.INPUT, inline || Classes.FILL, hasConflict && Classes.INTENT_DANGER)}
    onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(e.target.value, e)}
    {...props}
  />
}

interface TextAreaProps extends FieldComponentProps<string, HTMLTextAreaElement>, Pick<BlueprintTextAreaProps, 'growVertically'> {
  inputRef?: React.Ref<HTMLTextAreaElement>
}
export function TextArea({value, onChange, hasConflict, inline, inputRef, ...props} : TextAreaProps) {
  return <BlueprintTextArea
    inputRef={inputRef}
    value={value ?? ''}
    fill
    intent={hasConflict ? 'danger' : undefined}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
    onChange={e => onChange && onChange(e.target.value, e)}
    {...props}
  />
}
