import {useCallback, useEffect, useMemo, useState} from 'react'
import {arrayMoveImmutable} from 'array-move'
import * as L from 'partial.lenses'

import {NewValue, PropertyAtPath, StringPath, StringPathToList, toArrayPath} from './types'

import {FormMetadataContextType, useFormMetadata} from './formContext'

export interface FormHooksFor<T> {
  useValueAt: <P extends StringPath<T>>(path: P) => PropertyAtPath<T, P>
  useOnChangeFor: <P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path: P) => (v: NewValue<SubT>) => unknown
  useAppendToList: <P extends StringPathToList<T>, SubT extends PropertyAtPath<T, P> & unknown[]>(path: P) => (v: SubT[number] | ((v: SubT) => SubT[number])) => unknown
  useRemoveFromList: <P extends StringPathToList<T>>(path: P, index: number) => () => unknown
  useMoveItemInList: <P extends StringPathToList<T>>(path: P, index: number) => {
    moveTo: (newIndex: number) => unknown
    moveUp: () => unknown
    moveDown: () => unknown
  }
}

export function formHooksFor<T>(): FormHooksFor<T> {
  return {
    useValueAt,
    useOnChangeFor,
    useAppendToList: <P extends StringPath<T>>(path: P) => {
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
    useRemoveFromList,
    useMoveItemInList: <P extends StringPath<T>>(path: P, index: number) => {
      const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
      return useMemo(() => ({
        moveTo: (newIndex: number) => onChange(list => arrayMoveImmutable(list as unknown[], index, newIndex) as PropertyAtPath<T, P>),
        moveUp: () => { if (index > 0) onChange(list => arrayMoveImmutable(list as unknown[], index, index - 1) as PropertyAtPath<T, P>) },
        moveDown: () => onChange(list => arrayMoveImmutable(list as unknown[], index, index + 1) as PropertyAtPath<T, P>),
      }), [onChange, index])
    },
  } as FormHooksFor<T>
}

export function useValueAt<T, P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path : P) : SubT {
  const getValue = useCallback((ctx) => ctx.getValueAt(path), [path])
  return useFormValueSubscription(getValue)
}


export function useRemoveFromList<T, P extends StringPath<T>>(path: P, index: number) {
  const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
  return useCallback(() => onChange(L.set(index, undefined)), [onChange, index])
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

export function useOnChangeFor<T, P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path : P) : (v: NewValue<SubT>) => unknown {
  const { onChangePath } = useFormMetadata<T>()
  return useCallback(
    val => onChangePath(path, val),
    [onChangePath, path]
  )
}

interface FieldData<T> extends Pick<FormMetadataContextType<T>, 'readOnly' | 'inline' | 'labelStyle'> {
  value: T
  hasConflict: boolean
  onChange: (v: NewValue<T>) => unknown
}

export function useFieldAt<T, P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path : P) : FieldData<SubT> {
  const propagateOnChange = useOnChangeFor<T, P, SubT>(path)

  const ctx = useFormMetadata<T>()
  const [value, setValue] = useState(() => ctx.getValueAt<P, SubT>(path))
  const [hasConflict, setHasConflict] = useState(() => hasConflictsAtPath(ctx.getConflicts(), path))

  useEffect(() => {
    const callback = () => {
      setValue(ctx.getValueAt<P, SubT>(path))
      setHasConflict(hasConflictsAtPath(ctx.getConflicts(), path))
    }
    const unsubscribe = ctx.subscribeToChanges(callback)
    callback()
    return unsubscribe
  }, [ctx, path, setValue])

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

