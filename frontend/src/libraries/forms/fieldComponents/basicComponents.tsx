import React, { ComponentProps } from 'react'
import classNames from 'classnames'

import { ExtendedFieldComponentProps, FieldComponentProps, FieldPropsWithoutComponent } from '../types'

import { Switch, TextInput } from 'libraries/formsV2/components/inputs'
import { CssClass } from 'libraries/ui'

import { Field, useFieldData } from '../Field'
import { FieldContainer } from '../FieldContainer'
import { useFieldValueProps } from '../hooks'

export { NumberInput, Switch } from 'libraries/formsV2/components/inputs'

export type NumberInputProps = ExtendedFieldComponentProps<number, ComponentProps<'input'>>
export type InputProps = ExtendedFieldComponentProps<string, ComponentProps<'input'>>
export const Input = TextInput

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

interface SwitchProps extends FieldComponentProps<boolean> {
  label: string
}

type TextAreaProps = FieldComponentProps<string> & React.ComponentProps<'textarea'>

export function TextArea({ value, onChange, inline: _ignored, className, ...props }: TextAreaProps) {
  return <textarea
    value={value ?? ''}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
    onChange={e => onChange?.(e.target.value)}
    {...props}
    className={classNames(
      className,
      'resize-y',
      CssClass.input,
      CssClass.fill,

    )}
  />
}

interface RadioGroupProps<E extends string | null> extends FieldComponentProps<E> {
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
        onChange={() => onChange(optionValue)}
        {...rest}
      />
      {label}
    </label>,
  )
}
