import React from 'react';
import {FormGroup} from 'libraries/ui';
import {Path, PropertyAtPath} from './types'
import {useError, ErrorMessage, ValidationProps} from "../forms/validation";
import { useFormValueAt, useFormMetadata } from './formContext'

interface FieldComponentProps<T> {
  value: T
  onChange: (t: T) => unknown
  hasConflict: boolean
  readOnly: boolean
  id: string
  ariaProps: {
    "aria-describedby"?: string
    "aria-label"?: string
  }
}

interface FieldProps<Label extends string, P, Value> extends ValidationProps {
  path: P
  inline?: boolean
  label: Label extends '' ? never : Label
  component: React.JSXElementConstructor<FieldComponentProps<Value>>
}

export function fieldFor<T>() {
  return function Field<L extends string, P extends Path<T>, V extends PropertyAtPath<T,P>>(
    {
      label,
      path, 
      inline,
      component: Component,
      ...rest
    }: FieldProps<L, P, V>
  ) {
    const { value, onChange, conflicts } = useFormValueAt<T, P, V>(path)
    const { readOnly, labelStyle, inline: inlineFromCtx } = useFormMetadata()
    const error = useError(value, rest);
    const id = path.join(".")
    const errorId = `${id}-error`;

    const ariaProps = labelStyle === 'hidden'
      ? {"aria-describedby": errorId, "aria-label": label}
      : {"aria-describedby": errorId}

    return <FormWrapper label={label} labelStyle={labelStyle} inline={inline ?? inlineFromCtx} id={id}>
      <Component
        id={id}
        value={value}
        onChange={onChange} 
        hasConflict={conflicts.includes([] as Path<V>)}
        readOnly={readOnly}
        ariaProps={ariaProps}
      />
      <ErrorMessage id={errorId} error={error} />
    </FormWrapper>
  }
}

function FormWrapper({id, labelStyle, inline, label, children}) {
  if (labelStyle === 'hidden') {
    return inline ? <span>{children}</span> : <div>{children} </div>
  }

  const props = {
    labelFor: id,
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

const Field = fieldFor<{name: string, age: number}>()

function TextField(props: FieldComponentProps<string>) {
  return <p>{props.value}</p>
}

export const f = <Field label="Aa" path={['name']} component={TextField} />
export const f2 = <Field label="aa" path={['age']} component={({value, onChange}) => null} />
