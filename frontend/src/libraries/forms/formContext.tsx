import React, { useContext, useEffect, useMemo, useRef } from 'react'
import * as L from 'partial.lenses'

import { ChangeListener, Conflict, ConflictMap, LabelStyle, NewValue, OnFormChangeHandler, toArrayPath, TypedStringPath, Version } from './types'

import { formStringDefaults, FormStrings } from './strings'

export const FormValidityContext = React.createContext<boolean>(true)
export function useFormIsValid(): boolean {
  return useContext(FormValidityContext)
}

export interface FormMetadataContextType<T> {
  getValueAt: <V>(path: TypedStringPath<V, T>) => V
  getConflictAt: <V>(path: TypedStringPath<V, T>) => Conflict<V> | null
  onResolveConflict: <V>(path: TypedStringPath<V, T>, version: Version) => void
  getStrings: () => FormStrings
  subscribeToChanges: (f: ChangeListener) => (() => void)
  onChangePath: <V>(p: TypedStringPath<V, T>, t: NewValue<V>) => unknown
  readOnly: boolean
  inline: boolean
  labelStyle: LabelStyle
}
export const FormMetadataContext = React.createContext<FormMetadataContextType<unknown> | null>(null)

export interface useCreateFormMetadataContextArgs<T> extends
  Pick<Partial<FormMetadataContextType<T>>, 'readOnly' | 'inline' | 'labelStyle' | 'onResolveConflict'> {
  value: T
  onChange: OnFormChangeHandler<T>
  conflicts?: ConflictMap<T>
  strings?: FormStrings
}

export function useCreateFormMetadataContext<T>(
  { value, onChange, labelStyle, inline, readOnly, conflicts, strings, onResolveConflict }: useCreateFormMetadataContextArgs<T>,
): FormMetadataContextType<T> {
  const listeners = useMemo(() => new Set<ChangeListener>(), [])
  const valueRef = useRef<T>()
  valueRef.current = value
  const conflictsRef = useRef<ConflictMap<T>>()
  conflictsRef.current = conflicts
  const stringsRef = useRef<FormStrings>()
  stringsRef.current = strings ?? formStringDefaults

  const metadataContext = useMemo(
    () => {
      const onChangePath = (path, newValue) => {
        const val = valueRef.current
        valueRef.current = typeof newValue === 'function'
          ? L.modify(toArrayPath(path), newValue, val)
          : L.set(toArrayPath(path), newValue, val)

        onChange(valueRef.current as T, path)
      }
      return {
        getValueAt: (path) => L.get(toArrayPath(path), valueRef.current),
        getConflictAt: (path) => conflictsRef.current?.get?.(path),
        getStrings: () => stringsRef.current,
        subscribeToChanges: (listener: ChangeListener) => {
          /* eslint-disable-next-line react-hooks/immutability */
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        readOnly, labelStyle, inline,
        onChangePath,
        onResolveConflict,
      }
    }, [readOnly, labelStyle, inline, onChange, listeners, onResolveConflict],
  )

  useEffect(() => listeners.forEach(l => l()), [listeners, value])

  return metadataContext as FormMetadataContextType<T>
}

export function useFormMetadata<T>() {
  const ctx = useContext(FormMetadataContext) as FormMetadataContextType<T>
  if (ctx === null) throw new Error('No form metadata context')
  return ctx
}

export function useFormStrings(): FormStrings {
  const ctx = useContext(FormMetadataContext)
  return ctx?.getStrings() ?? formStringDefaults
}
