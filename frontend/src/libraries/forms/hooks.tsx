import {useCallback, useEffect, useMemo, useState} from 'react'
import {arrayMoveImmutable} from 'array-move'
import * as L from 'partial.lenses'

import {NewValue, Path, PropertyAtPath, TypedPath} from './types'

import {FormMetadataContextType, toArrayPath, useFormMetadata} from './formContext'

export interface FormHooksFor<T> {
  useValueAt: <P extends Path<T>>(path: P) => PropertyAtPath<T, P>
  useOnChangeFor: <P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path: P) => (v: NewValue<SubT>) => unknown
  useAppendToList: <P extends TypedPath<any[], T>, SubT extends PropertyAtPath<T, P> & any[]>(path: P) => (v: SubT[number] | ((v: SubT) => SubT[number])) => unknown
  useRemoveFromList: <P extends TypedPath<any[], T>>(path: P, index: number) => () => unknown
  useMoveItemInList: <P extends TypedPath<any[], T>>(path: P, index: number) => {
    moveTo: (newIndex: number) => unknown
    moveUp: () => unknown
    moveDown: () => unknown
  }
  useMemoizedPath: <P extends Path<T>>(path: P) => P
}

export function formHooksFor<T>(): FormHooksFor<T> {
  return {
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
    useMoveItemInList: <P extends Path<T>>(path: P, index: number) => {
      const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
      return useMemo(() => ({
        moveTo: (newIndex: number) => onChange(list => arrayMoveImmutable(list as unknown[], index, newIndex) as PropertyAtPath<T, P>),
        moveUp: () => { if (index > 0) onChange(list => arrayMoveImmutable(list as unknown[], index, index - 1) as PropertyAtPath<T, P>) },
        moveDown: () => onChange(list => arrayMoveImmutable(list as unknown[], index, index + 1) as PropertyAtPath<T, P>),
      }), [onChange, index])
    },
    useMemoizedPath,
  } as FormHooksFor<T>
}

export function useValueAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : SubT {
  const stablePath = useMemoizedPath(path)
  const getValue = useCallback((ctx) => L.get(stablePath, ctx.getValue()), [stablePath])
  return useFormValueSubscription(getValue)
}

export function useFormValueSubscription<T, V>(getValue: ((ctx: FormMetadataContextType<T>) => V)): V {
  const ctx = useFormMetadata<T>()
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

function useMemoizedPath<T>(path: T): T {
  const pathDep = getStringPath(path as Path<unknown>)
  //eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => path, [pathDep])
}

function getStringPath<P extends Path<unknown>>(path: P): string{
  return Array.isArray(path) ? path.join('.') : String(path)
}

interface FieldData<T> extends Pick<FormMetadataContextType<T>, 'readOnly' | 'inline' | 'labelStyle'> {
  value: T
  hasConflict: boolean
  onChange: (v: NewValue<T>) => unknown
}

export function useFieldAt<T, P extends Path<T>, SubT extends PropertyAtPath<T, P>>(path : P) : FieldData<SubT> {
  const propagateOnChange = useOnChangeFor<T, P, SubT>(path)

  const stablePath = useMemoizedPath(path)
  const ctx = useFormMetadata<T>()
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

function hasConflictsAtPath(conflicts, path) {
  const arrayPath = toArrayPath(path)
  return conflicts
    .some((conflict )=> conflict.length === arrayPath.length && arrayPath.every((key, i) => conflict[i] === key))
}

