import React, { useContext, useCallback } from 'react';
import * as L from 'partial.lenses';
import {NewValue, LabelStyle, Path, ArrayPath, PropertyAtPath} from './types'

export interface FormValueContextType<T> {
  value: T
  conflicts: ArrayPath<T>[]
  formIsValid: boolean
}
export interface FormMetadataContextType<T> {
  onChange: (t: NewValue<T>) => unknown
  onChangePath: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(p: P, t: NewValue<SubT>) => unknown
  readOnly: boolean
  inline: boolean
  labelStyle: LabelStyle
}

export const FormValueContext = React.createContext<FormValueContextType<unknown>|null>(null)
export const FormMetadataContext = React.createContext<FormMetadataContextType<unknown>|null>(null)

export function useFormMetadata<T>() {
  const ctx = useContext(FormMetadataContext) as FormMetadataContextType<T>
  if (ctx === null) throw new Error('No form metadata context');
  return ctx
}

export function useValueAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : SubT {
  return L.get(path, useFormValueContext<T>().value)
}
export function useOnChangeFor<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : (v: NewValue<SubT>) => unknown {
  const { onChangePath } = useFormMetadata<T>()
  const pathDep = Array.isArray(path) ? path.join("--") : String(path)
  return useCallback(
    val => onChangePath(path, val),
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [onChangePath, pathDep]
  )
}

export function useFormValueContextAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : FormValueContextType<SubT> {
  const ctx = useFormValueContext<T>()
  return useContextAtPath(ctx, path)
}
export function useFormValueContext<T>() : FormValueContextType<T> {
  const ctx = useContext(FormValueContext) as FormValueContextType<T>
  if (ctx === null) throw new Error('No form value context');
  return ctx
}

function useContextAtPath<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(
  ctx: FormValueContextType<T>,
  path: Path<T>
) : FormValueContextType<SubT> {
  return {
    value: L.get(path, ctx.value),
    conflicts: conflictsAtPath(ctx.conflicts, Array.isArray(path) ? path : [path]),
    formIsValid: ctx.formIsValid,
  }

}

export function toArrayPath<T>(path : Path<T>) : ArrayPath<T> {
  return Array.isArray(path) ? path : [path] as ArrayPath<T>
}

function conflictsAtPath(conflicts, path) {
  return conflicts
    .filter((conflict )=> conflict.length >= path.length && path.every((key, i) => conflict[i] === key))
    .map(conflict => conflict.slice(path.length))
}
