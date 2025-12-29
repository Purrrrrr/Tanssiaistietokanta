import React, { ComponentProps } from 'react'
import { Switch as BlueprintSwitch, TextArea as BlueprintTextArea, TextAreaProps as BlueprintTextAreaProps } from '@blueprintjs/core'
import classNames from 'classnames'

import { ExtendedFieldComponentProps, FieldComponentProps, FieldPropsWithoutComponent } from '../types'

import { CssClass } from 'libraries/ui'

import { Field, useFieldData } from '../Field'
import { FieldContainer } from '../FieldContainer'
import { useFieldValueProps } from '../hooks'

export interface SwitchForProps<V> {
  isChecked: (v: V | null | undefined) => boolean
  toValue: (b: boolean, v: V | null | undefined) => V
}
export type SwitchFieldForValueProps<T, V> = Omit<FieldPropsWithoutComponent<T, V>, 'labelStyle'>
export function switchFor<T, V>({ isChecked, toValue }: SwitchForProps<V>) {
  return function SwitchFieldForValue({ path, ...rest }: SwitchFieldForValueProps<T, V>) {
    const { value, onChange, ...dataProps } = useFieldValueProps<T, V>(path)
    const { fieldProps, containerProps } = useFieldData(path, value, rest)

    const onChangeMapped = (bool: boolean) => onChange(toValue(bool, value))

    const allProps = {
      value: isChecked(value),
      onChange: onChangeMapped,
      label: containerProps.label,
      ...fieldProps,
      ...dataProps,
    } as SwitchProps

    return <FieldContainer {...containerProps} labelStyle="hidden-nowrapper">
      <Switch {...allProps} />
    </FieldContainer>
  }
}

export type SwitchFieldProps<T> = Omit<FieldPropsWithoutComponent<T, boolean>, 'labelStyle'>
export function SwitchField<T>({ label, ...props }: SwitchFieldProps<T>) {
  return <Field<T, boolean, SwitchProps> {...props} label={label} labelStyle="hidden-nowrapper" component={Switch} componentProps={{ label }} />
}

export interface InputFieldProps<T> extends FieldPropsWithoutComponent<T, string> {
  componentProps?: Omit<InputProps, keyof FieldComponentProps<T>>
}
export function InputField<T>(props: InputFieldProps<T>) {
  return <Field<T, string, InputProps> {...props} component={Input} />
}

interface SwitchProps extends FieldComponentProps<boolean, HTMLInputElement> {
  label: string
}
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ value, onChange, readOnly, ...props }, ref) {
    return <BlueprintSwitch
      inputRef={ref}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked, e)}
      disabled={readOnly}
      {...props}
    />
  },
)

export interface NumberInputProps extends ExtendedFieldComponentProps<number, HTMLInputElement, ComponentProps<'input'>> {
  inputRef?: React.Ref<HTMLInputElement>
}
export function NumberInput({ value, className, onChange, inline = false, inputRef, ...props }: NumberInputProps) {
  return <input
    type="number"
    ref={inputRef}
    value={value ?? 0}
    className={classNames(className, CssClass.input, inline || CssClass.inputFill)}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(parseFloat(e.target.value), e)}
    {...props}
  />
}

export interface InputProps extends ExtendedFieldComponentProps<string, HTMLInputElement, ComponentProps<'input'>> {
  inputRef?: React.Ref<HTMLInputElement>
}
export function Input({ value, className, onChange, inline = false, inputRef, ...props }: InputProps) {
  return <input
    ref={inputRef}
    value={value ?? ''}
    className={classNames(className, CssClass.input, inline || CssClass.inputFill)}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(e.target.value, e)}
    {...props}
  />
}

interface TextAreaProps extends FieldComponentProps<string, HTMLTextAreaElement>, Pick<BlueprintTextAreaProps, 'growVertically'> {
  inputRef?: React.Ref<HTMLTextAreaElement>
}
export function TextArea({ value, onChange, inline: _ignored, inputRef, ...props }: TextAreaProps) {
  return <BlueprintTextArea
    inputRef={inputRef}
    value={value ?? ''}
    fill
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
    onChange={e => onChange?.(e.target.value, e)}
    {...props}
  />
}

interface RadioGroupProps<E extends string | null> extends FieldComponentProps<E, HTMLInputElement> {
  options: {
    value: E
    label: string
  }[]
}

export function RadioGroup<E extends string>({ options, id, value, onChange, ...rest }: RadioGroupProps<E>) {
  return options.map(({ value: optionValue, label }) =>
    <label key={optionValue} className="mx-2">
      <input
        className="me-1"
        type="radio"
        id={`${id}-${optionValue}`}
        key={optionValue}
        value={optionValue ?? ''}
        checked={optionValue === (value ?? null)}
        onChange={e => onChange(optionValue, e)}
        {...rest}
      />
      {label}
    </label>,
  )
}
