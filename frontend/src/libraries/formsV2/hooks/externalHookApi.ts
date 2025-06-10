import { useSyncExternalStore } from 'react'

import { DataPath, ListItem, ListPath } from '../types'

import { useFormContext } from '../context'
import { addItem, change, removeItem } from '../reducer'

export function useValueAt<T, Data = unknown>(path: DataPath<T, Data>): T {
  const { getValueAt, subscribe } = useFormContext<Data>()
  return useSyncExternalStore(subscribe, () => getValueAt<T>(path))
}

export function useChangeAt<T, Data = unknown>(path: DataPath<T, Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T) => dispatch(change(path, value))
}

export function useRemoveItem<Data = unknown>() {
  const { dispatch } = useFormContext<Data>()

  return (path: ListPath<Data>, index: number) => dispatch(removeItem(path, index))
}

export function useRemoveItemAt<T, Data = unknown>(path: DataPath<T[], Data>) {
  const { dispatch } = useFormContext<Data>()

  return (index: number) => dispatch(removeItem(path, index))
}

export function useAddItem<T extends ListItem, Data = unknown>() {
  const { dispatch } = useFormContext<Data>()

  return <Path extends DataPath<T[], Data>>(path: Path, value: T, index: number = Infinity) => {
    dispatch(addItem(path, index, value))
  }
}

export function useAddItemAt<T extends ListItem, Data = unknown>(path: DataPath<T[], Data>) {
  const { dispatch } = useFormContext<Data>()

  return (value: T, index: number = Infinity) => dispatch(addItem(path, index, value))
}
