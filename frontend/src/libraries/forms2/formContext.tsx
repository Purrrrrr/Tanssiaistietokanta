import React, { useContext, useCallback } from 'react';
import * as L from 'partial.lenses';
import {LabelStyle, Path, ArrayPath, PropertyAtPath} from './types'

export interface FormValueContextType<T> {
  value: T
  onChange: (t: T) => unknown
  conflicts: ArrayPath<T>[]
  formIsValid: boolean
}
export interface FormMetadataContextType {
  readOnly: boolean
  inline: boolean
  labelStyle: LabelStyle
}

export const FormValueContext = React.createContext<FormValueContextType<unknown>|null>(null)
export const FormMetadataContext = React.createContext<FormMetadataContextType|null>(null)

export function useFormMetadata() {
  const ctx = useContext(FormMetadataContext)
  if (ctx === null) throw new Error('No form metadata context');
  return ctx
}

export function useFormValueAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : FormValueContextType<SubT> {
  const ctx = useFormValue<T>()
  return useContextAtPath(ctx, path)
}
export function useFormValue<T>() : FormValueContextType<T> {
  const ctx = useContext(FormValueContext) as FormValueContextType<T>
  if (ctx === null) throw new Error('No form value context');
  return ctx
}

function useContextAtPath<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(
  ctx: FormValueContextType<T>,
  path: Path<T>
) : FormValueContextType<SubT> {
  const { value, onChange: originalOnChange } = ctx
  const onChange = useCallback(changeArg => {
    if (typeof(changeArg) === 'function') originalOnChange(L.modify(path, changeArg))
    else originalOnChange(L.set(path, changeArg, value));
  }, [originalOnChange, value, path])

  return {
    value: L.get(path, ctx.value),
    onChange,
    conflicts: conflictsAtPath(ctx.conflicts, Array.isArray(path) ? path : [path]),
    formIsValid: ctx.formIsValid,
  }

}

function conflictsAtPath(conflicts, path) {
  return conflicts
    .filter((conflict )=> conflict.length >= path.length && path.every((key, i) => conflict[i] === key))
    .map(conflict => conflict.slice(path.length))
}
