import React, { useContext, useEffect, useMemo, useRef } from 'react'
import * as L from 'partial.lenses'

import {ArrayPath, ChangeListener, LabelStyle, NewValue, PropertyAtPath, StringPath, toArrayPath} from './types'

export const FormValidityContext = React.createContext<boolean>(true)
export function useFormIsValid(): boolean {
  return useContext(FormValidityContext)
}

export interface FormMetadataContextType<T> {
  getValueAt: <P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path: P) => SubT
  getConflicts: () => ArrayPath<T>[]
  subscribeToChanges: (f: ChangeListener) => (() => void)
  onChangePath: <P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(p: P, t: NewValue<SubT>) => unknown
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
        getValueAt: (path) => L.get(toArrayPath(path), valueRef.current),
        getConflicts: () => conflictsRef.current ?? [],
        subscribeToChanges: (listener: ChangeListener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        readOnly, labelStyle, inline,
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
