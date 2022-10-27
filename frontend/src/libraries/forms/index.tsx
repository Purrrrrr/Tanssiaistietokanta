import React, {useCallback} from 'react'
import * as L from 'partial.lenses'

import {NewValue, Path, PropertyAtPath, TypedPath} from './types'

import {Field, FieldProps} from './Field'
import {InputField, InputFieldProps, SwitchField, SwitchFieldProps} from './fieldComponents'
import {Form, FormProps} from './Form'
import {useMemoizedPath, useOnChangeFor, useValueAt} from './formContext'

export * from './closableEditors'
export * from './fieldComponents'
export * from './formControls'
export * from './MarkdownEditor'
export * from './Selector'
export * from './SyncStatus'
export type { FieldComponentProps } from './types'
export * from './useAutosavingState'
export {Validate} from './validation'

interface FormFor<T> {
  Form: React.JSXElementConstructor<FormProps<T>>
  Field: <L, P extends Path<T>, V extends PropertyAtPath<T, P>, C extends React.ElementType, AP>(props: FieldProps<L, P, V, C, AP>) => React.ReactElement
  Switch: <L, P extends TypedPath<T, P, boolean>, V extends PropertyAtPath<T, P> & boolean>(props: SwitchFieldProps<L, P, V>) => React.ReactElement
  Input: <L, P extends TypedPath<T, P, string | undefined | null>, V extends PropertyAtPath<T, P> & (string | undefined | null)>(props: InputFieldProps<L, P, V>) => React.ReactElement
  useValueAt: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path: P) => SubT
  useOnChangeFor: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path: P) => (v: NewValue<SubT>) => unknown
  useAppendToList: <P extends TypedPath<T, P, unknown[]>, SubT extends PropertyAtPath<T, P> & unknown[]>(path: P) => (v: SubT[number] | ((v: SubT) => SubT[number])) => unknown
  useRemoveFromList: <P extends TypedPath<T, P, unknown[]>>(path: P, index: number) => () => unknown
  useMemoizedPath: <P extends Path<T>>(path: P) => P
}

export function formFor<T>(): FormFor<T> {
  return {
    Form,
    Field,
    Switch: SwitchField,
    Input: InputField,
    useValueAt,
    useOnChangeFor,
    useAppendToList: <P extends Path<T>>(path: P) => {
      const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
      return useCallback((item) => {
        onChange(items =>
          L.set(
            L.append,
            typeof(item) === 'function' ? (item as ((t: PropertyAtPath<T, P>) => unknown))(items) : item,
            items,
          )
        )
      }, [onChange])
    },
    useRemoveFromList: <P extends Path<T>>(path: P, index: number) => {
      const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
      return useCallback((item) => onChange(L.set(index, undefined)), [onChange, index])
    },
    useMemoizedPath,
  } as FormFor<T>
}
