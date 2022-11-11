import {useCallback, useEffect, useMemo, useState} from 'react'
import {arrayMoveImmutable} from 'array-move'
import * as L from 'partial.lenses'

import {FieldDataProps, NewValue, PropertyAtPath, StringPath, StringPathToList, toArrayPath} from './types'

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
  const ctx = useFormMetadata<T>()
  const [state, setState] = useState<SubT>(() => ctx.getValueAt(path))
  useFormValueSubscription(ctx, useCallback(
    () => setState(ctx.getValueAt<P, SubT>(path)),
    [ctx, path]
  ))
  return state
}

export function useFieldValueProps<T, P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(
  path : P
): FieldDataProps<SubT>
{
  const ctx = useFormMetadata<T>()
  const [value, setValue] = useState(() => ctx.getValueAt<P, SubT>(path))
  const [hasConflict, setHasConflict] = useState(() => hasConflictsAtPath(ctx.getConflicts(), path))

  useFormValueSubscription(ctx, useCallback(
    () => {
      setValue(ctx.getValueAt<P, SubT>(path))
      setHasConflict(hasConflictsAtPath(ctx.getConflicts(), path))
    },
    [ctx, path]
  ))

  const propagateOnChange = useOnChangeFor<T, P, SubT>(path)
  const onChange = useCallback((v) => {
    setValue(v)
    propagateOnChange(v)
  }, [propagateOnChange])

  return { value, onChange, hasConflict }
}

function hasConflictsAtPath(conflicts, path) {
  const arrayPath = toArrayPath(path)
  return conflicts
    .some((conflict )=> conflict.length === arrayPath.length && arrayPath.every((key, i) => conflict[i] === key))
}

export function useRemoveFromList<T, P extends StringPath<T>>(path: P, index: number) {
  const onChange = useOnChangeFor<T, P, PropertyAtPath<T, P>>(path)
  return useCallback(() => onChange(L.set(index, undefined)), [onChange, index])
}

export function useFormValueSubscription<T>(ctx: FormMetadataContextType<T>, callback: () => unknown) {
  useEffect(() => {
    const unsubscribe = ctx.subscribeToChanges(callback)
    callback()
    return unsubscribe
  }, [ctx, callback])
  return ctx
}

export function useOnChangeFor<T, P extends StringPath<T>, SubT extends PropertyAtPath<T, P>>(path : P) : (v: NewValue<SubT>) => unknown {
  const { onChangePath } = useFormMetadata<T>()
  return useCallback(
    val => onChangePath(path, val),
    [onChangePath, path]
  )
}


