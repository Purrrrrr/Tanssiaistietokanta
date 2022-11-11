import React  from 'react'

import {FieldComponentDisplayProps, FieldComponentPropsWithoutEvent, NoRequiredProperties, PartialWhen, PropertyAtPath, StringPath } from './types'

import { FieldContainer, FieldContainerProps, UserGivenFieldContainerProps } from './FieldContainer'
import { useFormMetadata } from './formContext'
import { useFieldValueProps } from './hooks'
import {useError, ValidationProps} from './validation'

export type FieldProps<ValuePath, Value, Component extends React.ElementType, AdditionalProps> =
  {
    path: ValuePath
    component: Component & React.JSXElementConstructor<FieldComponentPropsWithoutEvent<Value> & AdditionalProps>
  }
  & FieldDataHookProps
  & MaybeComponentProps<Omit<React.ComponentPropsWithoutRef<Component>, keyof FieldComponentPropsWithoutEvent<Value>>>

type MaybeComponentProps<Props extends object> = PartialWhen<NoRequiredProperties<Props>, { componentProps: Props }>

export function Field<T, P extends StringPath<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(
  { path, component: Component, componentProps, ...rest }: FieldProps<P, V, C, AP>
) {
  const dataProps = useFieldValueProps<T, P, V>(path)
  const { fieldProps, containerProps } = useFieldData(path, dataProps.value, rest)

  return <FieldContainer {...containerProps}>
    <Component {...componentProps as any} {...fieldProps} {...dataProps} />
  </FieldContainer>
}

interface FieldDataHookProps extends UserGivenFieldContainerProps, ValidationProps {}

interface FieldData {
  fieldProps: FieldComponentDisplayProps
  containerProps: FieldContainerProps
}

export function useFieldData<Value>(
  path: string | number,
  value: Value,
  {label, labelInfo, helperText, inline: maybeInline, labelStyle: maybeLabelStyle, ...rest}: FieldDataHookProps
) : FieldData {

  const ctx = useFormMetadata<unknown>()
  const {inline, labelStyle, readOnly} = ctx

  const id = String(path).replace(/\./g, '--')
  const errorId = `${id}--error`
  const error = useError(value, rest)

  const ariaProps = (maybeLabelStyle ?? labelStyle) === 'hidden'
    ? {'aria-label': labelInfo ? `${label} ${labelInfo}` : label}
    : {}
  return {
    fieldProps: {
      id,
      inline: maybeInline ?? inline,
      readOnly,
      'aria-describedby': errorId,
      ...ariaProps
    },
    containerProps: {
      id,
      errorId,
      error,
      label,
      labelInfo,
      labelStyle,
      inline: maybeInline ?? inline,
    }
  }
}
