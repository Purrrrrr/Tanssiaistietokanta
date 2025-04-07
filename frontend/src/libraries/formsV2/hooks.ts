import { useSyncExternalStore } from 'react'

import { DataPath } from './types'

import { useFormContext } from './context'
import { change } from './reducer'

export function useValueAt<T, Data = unknown>(path: DataPath<T, Data>): T {
  const { getValueAt, subscribe } = useFormContext<Data>()
  return useSyncExternalStore(subscribe, () => getValueAt<T>(path))
}

export function useChangeAt<T, Data = unknown>(path: DataPath<T, Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}
