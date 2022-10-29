import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'partial.lenses'

import {ArrayPath, ChangeListener, LabelStyle, NewValue, Path, PropertyAtPath} from './types'

export const FormValidityContext = React.createContext<boolean>(true)
export function useFormIsValid(): boolean {
  return useContext(FormValidityContext)
}

export interface FormMetadataContextType<T> {
  getValue: () => T
  getConflicts: () => ArrayPath<T>[]
  subscribeToChanges: (f: ChangeListener) => (() => void)
  onChange: (t: NewValue<T>) => unknown
  onChangePath: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(p: P, t: NewValue<SubT>) => unknown
  readOnly: boolean
  inline: boolean
  labelStyle: LabelStyle
}
export const FormMetadataContext = React.createContext<FormMetadataContextType<unknown>|null>(null)

export function useCreateFormMetadataContext<T>({value, onChange, labelStyle, inline, readOnly, conflicts}): FormMetadataContextType<T> {
  const listeners = useMemo(() => new Set<ChangeListener>(), [])
  const valueRef = useRef<T>()
  valueRef.current = value
  const conflictsRef = useRef<ArrayPath<T>[]>()
  conflictsRef.current = conflicts

  const metadataContext = useMemo(
    () => {
      const onChangePath = (path, newValue) => {
        const val = valueRef.current
        valueRef.current = typeof newValue  === 'function'
          ? L.modify(toArrayPath(path), newValue, val)
          : L.set(toArrayPath(path), newValue, val)

        onChange(valueRef.current as T)
      }
      return {
        getValue: () => valueRef.current,
        getConflicts: () => conflictsRef.current ?? [],
        subscribeToChanges: (listener: ChangeListener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        readOnly, labelStyle, inline,
        onChange: (value) => onChangePath([], value),
        onChangePath,
      }
    }, [readOnly, labelStyle, inline, onChange, listeners]
  )

  useEffect(() => listeners.forEach(l => l()), [listeners, value])

  return metadataContext as FormMetadataContextType<T>
}

export function useFormMetadata<T>() {
  const ctx = useContext(FormMetadataContext) as FormMetadataContextType<T>
  if (ctx === null) throw new Error('No form metadata context')
  return ctx
}

interface FieldData<T> extends Pick<FormMetadataContextType<T>, 'readOnly' | 'inline' | 'labelStyle'> {
  value: T
  hasConflict: boolean
  onChange: (v: NewValue<T>) => unknown
}

export function useValueAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : SubT {
  const stablePath = useMemoizedPath(path)
  const getValue = useCallback((ctx) => L.get(stablePath, ctx.getValue()), [stablePath])
  return useFormValueSubscription(getValue)
}
export function useFieldAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : FieldData<SubT> {
  const propagateOnChange = useOnChangeFor<T, P, SubT>(path)

  const stablePath = useMemoizedPath(path)
  const ctx = useContext(FormMetadataContext) as FormMetadataContextType<T>
  const [value, setValue] = useState(() => L.get(stablePath, ctx.getValue()))
  const [hasConflict, setHasConflict] = useState(() => hasConflictsAtPath(ctx.getConflicts(), stablePath))

  useEffect(() => {
    const callback = () => {
      setValue(L.get(stablePath, ctx.getValue()))
      setHasConflict(hasConflictsAtPath(ctx.getConflicts(), stablePath))
    }
    const unsubscribe = ctx.subscribeToChanges(callback)
    callback()
    return unsubscribe
  }, [ctx, stablePath, setValue])

  const onChange = useCallback((v) => {
    setValue(v)
    propagateOnChange(v)
  }, [propagateOnChange])

  const {inline, labelStyle, readOnly} = ctx
  return {
    inline,
    labelStyle,
    readOnly,
    value,
    onChange,
    hasConflict
  }
}

export function useFormValueSubscription<T, V>(getValue: ((ctx: FormMetadataContextType<T>) => V)): V {
  const ctx = useContext(FormMetadataContext) as FormMetadataContextType<T>
  const [state, setState] = useState(() => getValue(ctx))

  useEffect(() => {
    const callback = () => setState(getValue(ctx))
    const unsubscribe = ctx.subscribeToChanges(callback)
    callback()
    return unsubscribe
  }, [ctx, getValue])
  return state
}

export function useOnChangeFor<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : (v: NewValue<SubT>) => unknown {
  const { onChangePath } = useFormMetadata<T>()
  const stablePath = useMemoizedPath(path)
  return useCallback(
    val => onChangePath(stablePath, val),
    [onChangePath, stablePath]
  )
}

function hasConflictsAtPath(conflicts, path) {
  const arrayPath = toArrayPath(path)
  return conflicts
    .some((conflict )=> conflict.length === arrayPath.length && arrayPath.every((key, i) => conflict[i] === key))
}

export function useMemoizedPath<T>(path: T): T {
  const pathDep = getStringPath(path as Path<unknown>)
  //eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => path, [pathDep])
}

function toArrayPath<T>(p: Path<T>): ArrayPath<T> {
  if (Array.isArray(p)) return p
  return String(p).split('.') as ArrayPath<T>
}

function getStringPath<P extends Path<unknown>>(path: P): string{
  return Array.isArray(path) ? path.join('.') : String(path)
}
