import React from 'react'
import {FormGroup} from 'libraries/ui'
import {FieldComponentProps, LabelStyle, Path, PropertyAtPath, PartialWhen, NoRequiredProperties} from './types'
import {useError, ErrorMessage, ValidationProps} from './validation'
import { useValueAt, useHasConflictsAt, useFormMetadata, useOnChangeFor } from './formContext'

export type FieldProps<Label, ValuePath, Value, Component extends React.ElementType, AdditionalProps> = 
  {
    path: ValuePath
    inline?: boolean
    label: Label extends string
      ? Label extends '' ? never : Label
      : never
    labelInfo?: string
    helperText?: string
    labelStyle?: LabelStyle
    component: Component & React.JSXElementConstructor<FieldComponentProps<Value> & AdditionalProps>
  }
  & ValidationProps
  & MaybeComponentProps<Omit<React.ComponentPropsWithoutRef<Component>, keyof FieldComponentProps<Value>>>

type MaybeComponentProps<Props extends object> = PartialWhen<NoRequiredProperties<Props>, { componentProps: Props }>

export function Field<T, L, P extends Path<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(
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
  }: FieldProps<L, P, V, C, AP>
) {
  const hasConflict = useHasConflictsAt<T, P>(path)
  const value = useValueAt<T, P, V>(path)
  const { readOnly, labelStyle: labelStyleFromCtx, inline: inlineFromCtx } = useFormMetadata()
  const onChange = useOnChangeFor<T, P, V>(path)
  const error = useError(value, rest)
  const id = Array.isArray(path) ? path.join('--') : String(path)
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
      hasConflict={hasConflict}
      readOnly={readOnly}
      {...ariaProps}
    />
    <ErrorMessage id={errorId} error={error} />
  </FormWrapper>
}

function FormWrapper({id, labelStyle, inline, label, labelInfo, helperText, children}) {
  if (labelStyle === 'hidden') {
    return inline ? <span>{children}{helperText}</span> : <div>{children}{helperText}</div>
  }

  const props = {
    labelFor: id,
    labelInfo,
    helperText,
    inline: false,
    inlineFill: false,
  }
  if (labelStyle === 'inline') {
    if (inline) props.inline = true
    else props.inlineFill = true
  }
  return <FormGroup {...props} label={label} >
    {children}
  </FormGroup>
}

