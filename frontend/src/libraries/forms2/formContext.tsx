import React, { useContext, useCallback } from 'react';
import * as L from 'partial.lenses';
import {NewValue, LabelStyle, Path, ArrayPath, PropertyAtPath} from './types'

export interface FormValueContextType<T> {
  value: T
  onChange: (t: NewValue<T>) => unknown
  onChangePath: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(p: P, t: NewValue<SubT>) => unknown
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

export function useValueAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : SubT {
  return L.get(path, useFormValueContext<T>().value)
}
export function useOnChangeFor<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : (v: NewValue<SubT>) => unknown {
  const { onChangePath } = useFormValueContext<T>()
  return useCallback(
    val => onChangePath(path, val),
    [onChangePath, path]
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
  const { value, onChangePath: originalOnChangePath } = ctx
  const onChange = useCallback(val => {
    originalOnChangePath(path, val)
  }, [originalOnChangePath, path])
  const onChangePath = useCallback((subPath, val) => {
    const fullPath = [...toArrayPath(path), ...toArrayPath(subPath)] as Path<T>
    originalOnChangePath(fullPath, val)
  }, [originalOnChangePath, path])

  return {
    value: L.get(path, value),
    onChange,
    onChangePath,
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
