import React, {ComponentProps} from 'react'
import {Classes, Switch as BlueprintSwitch, TextArea as BlueprintTextArea, TextAreaProps as BlueprintTextAreaProps} from '@blueprintjs/core'
import classNames from 'classnames'

import {Field, FieldDataHookProps} from '../Field'
import {FieldComponentProps, TypedStringPath} from '../types'

interface BaseFieldProps<T, V> extends FieldDataHookProps {
  path: TypedStringPath<V, T>
}

type AdditionalPropsFrom<Props> = Omit<Props, keyof FieldComponentProps<unknown>>

export type SwitchFieldProps<T> = Omit<BaseFieldProps<T, boolean>, 'labelStyle'>
export function SwitchField<T>({label, ...props} : SwitchFieldProps<T>) {
  return <Field<T, boolean, SwitchProps> {...props} label={label} labelStyle="hidden" component={Switch} componentProps={{label}} />
}

export interface InputFieldProps<T> extends BaseFieldProps<T, string> {
  componentProps?: AdditionalPropsFrom<InputProps>
}
export function InputField<T>(props : InputFieldProps<T>) {
  return <Field<T, string, InputProps> {...props} component={Input} />
}

interface SwitchProps extends FieldComponentProps<boolean, HTMLInputElement> {
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

export interface InputProps extends FieldComponentProps<string, HTMLInputElement>, AdditionalPropsFrom<ComponentProps<'input'>> {
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
