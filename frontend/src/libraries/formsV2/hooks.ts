import { useCallback, useEffect, useState } from 'react'

//import * as L from 'partial.lenses'
import { PathFor } from './types'

import { useFormContext } from './context'
import { apply, change, subscribe, SubscriptionCallback, unsubscribe } from './reducer'

export function useValueAt<T, Data = unknown>(path: PathFor<Data>): T {
  const { getValueAt } = useFormContext()
  const [value, setValue] = useState(() => getValueAt<T>(path))
  useFormValueSubscription(path, () => setValue(getValueAt(path)))

  return value
}

export function useFieldValueProps<T, Data = unknown>(path: PathFor<Data>) {
  const { getValueAt, dispatch } = useFormContext()
  const [value, setValue] = useState(() => getValueAt<T>(path))
  useFormValueSubscription(path, useCallback(() => setValue(getValueAt(path)), [path, getValueAt]))

  const onChange = useCallback((value: T) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])
  return { value, onChange }
}

export function useChange<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}

export function useApply<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (modifier: (value: T) => T) => dispatch(apply(path, modifier as (value: unknown) => unknown))
}

export function useFormValueSubscription<Data>(path: PathFor<Data>, callback: SubscriptionCallback<Data>) {
  const { dispatch } = useFormContext<Data>()
  useEffect(
    () => {
      dispatch(subscribe(path, callback))
      return () => dispatch(unsubscribe(path, callback))
    },
    [dispatch, path, callback]
  )
}
