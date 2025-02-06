import { useSyncExternalStore } from 'react'

import { PathFor } from './types'

import { useFormContext } from './context'
import { apply, change } from './reducer'

export function useValueAt<T, Data = unknown>(path: PathFor<Data>): T {
  const { getValueAt, subscribe } = useFormContext()
  return useSyncExternalStore(subscribe, () => getValueAt<T>(path))
}

export function useChange<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}

export function useApply<T, Data = unknown>(path: PathFor<Data>) {
  const { dispatch } = useFormContext<Data>()

  return (modifier: (value: T) => T) => dispatch(apply(path, modifier as (value: unknown) => unknown))
}
