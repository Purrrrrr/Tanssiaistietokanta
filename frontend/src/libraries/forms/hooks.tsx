import {useCallback, useEffect, useMemo, useState} from 'react'
import {arrayMoveImmutable} from 'array-move'
import * as L from 'partial.lenses'

import {AnyList, FieldDataProps, NewValue, PropertyAtPath, StringPath, StringPathToList, TypedStringPath} from './types'

import {FormMetadataContextType, useFormMetadata} from './formContext'

export interface FormHooksFor<T> {
  useValueAt: <P extends StringPath<T>>(path: P) => PropertyAtPath<T, P>
  useOnChangeFor: <P extends StringPath<T>>(path: P) => (v: NewValue<PropertyAtPath<T, P>>) => unknown
  useAppendToList: <P extends StringPathToList<T>, SubT extends PropertyAtPath<T, P> & unknown[]>(path: P) => (v: SubT[number] | ((v: SubT) => SubT[number])) => unknown
  useRemoveFromList: (path: StringPathToList<T>, index: number) => () => unknown
  useMoveItemInList: (path: StringPathToList<T>, index: number) => {
    moveTo: (newIndex: number) => unknown
    moveUp: () => unknown
    moveDown: () => unknown
  }
}

export function formHooksFor<T>(): FormHooksFor<T> {
  return {
    useValueAt,
    useOnChangeFor: useOnChangeFor,
    useAppendToList: (path: StringPathToList<T>) => {
      const onChange = useOnChangeFor<T, AnyList>(path)
      return useCallback((item) => {
        onChange(items =>
          L.set(
            L.append,
            typeof(item) === 'function' ? (item as ((t: unknown[]) => unknown))(items) : item,
            items,
          )
        )
      }, [onChange])
    },
    useRemoveFromList,
    useMoveItemInList: (path: StringPathToList<T>, index: number) => {
      const onChange = useOnChangeFor<T, AnyList>(path)
      return useMemo(() => ({
        moveTo: (newIndex: number) => onChange(list => arrayMoveImmutable(list as unknown[], index, newIndex) as AnyList),
        moveUp: () => { if (index > 0) onChange(list => arrayMoveImmutable(list as unknown[], index, index - 1) as AnyList) },
        moveDown: () => onChange(list => arrayMoveImmutable(list as unknown[], index, index + 1) as AnyList),
      }), [onChange, index])
    },
  } as FormHooksFor<T>
}

export function useValueAt<T, V>(path: TypedStringPath<V, T>) : V{
  const ctx = useFormMetadata<T>()
  const [state, setState] = useState<V>(() => ctx.getValueAt(path))
  useFormValueSubscription(ctx, useCallback(
    () => setState(ctx.getValueAt(path)),
    [ctx, path]
  ))
  return state
}

export function useFieldValueProps<T, V>(
  path : TypedStringPath<V, T>
): FieldDataProps<V>
{
  const ctx = useFormMetadata<T>()
  const [value, setValue] = useState(() => ctx.getValueAt<V>(path))

  useFormValueSubscription(ctx, useCallback(
    () => {
      setValue(ctx.getValueAt<V>(path))
    },
    [ctx, path]
  ))

  const onChange = useCallback((v) => {
    setValue(v)
    ctx.onChangePath<V>(path, v)
  }, [ctx, path])

  return { value, onChange }
}

export function useRemoveFromList<T>(path: StringPathToList<T>, index: number) {
  const onChange = useOnChangeFor<T, AnyList>(path)
  return useCallback(
    () => onChange(L.set(index, undefined)),
    [onChange, index]
  )
}

export function useFormValueSubscription<T>(ctx: FormMetadataContextType<T>, callback: () => unknown) {
  useEffect(() => {
    const unsubscribe = ctx.subscribeToChanges(callback)
    callback()
    return unsubscribe
  }, [ctx, callback])
  return ctx
}

export function useOnChangeFor<T, V>(path : TypedStringPath<V, T>) : (v: NewValue<V>) => unknown {
  const { onChangePath } = useFormMetadata<T>()
  return useCallback(
    val => onChangePath(path, val),
    [onChangePath, path]
  )
}


