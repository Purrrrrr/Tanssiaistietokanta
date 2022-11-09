import React from 'react'

import {FormGroup} from 'libraries/ui'

import {FieldComponentProps, LabelStyle, NoRequiredProperties, PartialWhen, PropertyAtPath, StringPath} from './types'

import { useFieldAt } from './hooks'
import {ErrorMessage, useError, ValidationProps} from './validation'

export type FieldProps<ValuePath, Value, Component extends React.ElementType, AdditionalProps> =
  {
    path: ValuePath
    inline?: boolean
    label: string
    labelInfo?: string
    helperText?: string
    labelStyle?: LabelStyle
    component: Component & React.JSXElementConstructor<FieldComponentProps<Value> & AdditionalProps>
  }
  & ValidationProps
  & MaybeComponentProps<Omit<React.ComponentPropsWithoutRef<Component>, keyof FieldComponentProps<Value>>>

type MaybeComponentProps<Props extends object> = PartialWhen<NoRequiredProperties<Props>, { componentProps: Props }>

export function Field<T, P extends StringPath<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(
  {
    label,
    labelInfo,
    helperText,
    labelStyle,
    path,
    inline,
    component: Component,
    componentProps,
    ...rest
  }: FieldProps<P, V, C, AP>
) {
  const {
    value,
    hasConflict,
    onChange,
    readOnly,
    labelStyle: labelStyleFromCtx,
    inline: inlineFromCtx,
  } = useFieldAt<T, P, V>(path)
  const error = useError(value, rest)
  const id = String(path).replace(/\./g, '--')
  const errorId = `${id}--error`

  const ariaProps = labelStyle === 'hidden'
    ? {'aria-describedby': errorId, 'aria-label': labelInfo ? `${label} ${labelInfo}` : label}
    : {'aria-describedby': errorId}

  return <FormWrapper label={label} labelInfo={labelInfo} helperText={helperText} labelStyle={labelStyle ?? labelStyleFromCtx} inline={inline ?? inlineFromCtx} id={id}>
    <Component
      {...componentProps as any}
      id={id}
      value={value}
      onChange={onChange}
      inline={inline}
      hasConflict={hasConflict}
      readOnly={readOnly}
      {...ariaProps}
    />
    <ErrorMessage id={errorId} error={error} />
  </FormWrapper>
}

function FormWrapper({id, labelStyle, inline, label, labelInfo, helperText, children}) {
  const formGroupId = `${id}--formgroup`

  if (labelStyle === 'hidden') {
    return inline
      ? <span id={formGroupId}>{children}{helperText}</span>
      : <div id={formGroupId}>{children}{helperText}</div>
  }

  const props = {
    labelFor: id,
    labelInfo,
    helperText,
  }
  return <FormGroup id={formGroupId} labelStyle={labelStyle} inline={inline} {...props} label={label} >
    {children}
  </FormGroup>
}

