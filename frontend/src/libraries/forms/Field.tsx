import React  from 'react'

import {FieldComponentDisplayProps, FieldComponentPropsWithoutEvent, NoRequiredProperties, PartialWhen, TypedStringPath, UserGivenFieldContainerProps } from './types'

import { FieldContainer, FieldContainerProps } from './FieldContainer'
import { useFormMetadata } from './formContext'
import { useFieldValueProps } from './hooks'
import {useError, ValidationProps} from './validation'

export type UntypedFieldProps<ValuePath, Value, Component extends React.ElementType, AdditionalProps> =
  {
    path: ValuePath
    component: Component & React.JSXElementConstructor<FieldComponentPropsWithoutEvent<Value> & AdditionalProps>
  }
  & FieldDataHookProps
  & MaybeComponentProps<Omit<React.ComponentPropsWithoutRef<Component>, keyof FieldComponentPropsWithoutEvent<Value>>>

type MaybeComponentProps<Props extends object> = PartialWhen<NoRequiredProperties<Props>, { componentProps: Props }>

export type FieldProps<T, V, P extends FieldComponentPropsWithoutEvent<V>> = {
  path: TypedStringPath<V, T>
  component: React.JSXElementConstructor<P>
} & FieldDataHookProps & MaybeComponentProps<Omit<P, keyof FieldComponentPropsWithoutEvent<V>>>

export function Field<T, V, P extends FieldComponentPropsWithoutEvent<V>>(
  { path, component: Component, componentProps, ...rest }: FieldProps<T, V, P>
) {
  const dataProps = useFieldValueProps<T, V>(path)
  const { fieldProps, containerProps } = useFieldData(path, dataProps.value, rest)

  const allProps = {
    ...componentProps, ...fieldProps, ...dataProps
  } as P

  return <FieldContainer {...containerProps}><Component {...allProps}  /></FieldContainer>
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
  const inline = maybeInline ?? ctx.inline
  const labelStyle = maybeLabelStyle ?? ctx.labelStyle

  const id = String(path).replace(/\./g, '--')
  const errorId = `${id}--error`
  const error = useError(value, rest)

  const ariaProps = labelStyle === 'hidden' || labelStyle === 'hidden-nowrapper'
    ? {'aria-label': labelInfo ? `${label} ${labelInfo}` : label}
    : {}
  return {
    fieldProps: {
      id,
      inline: maybeInline ?? inline,
      readOnly: ctx.readOnly,
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
