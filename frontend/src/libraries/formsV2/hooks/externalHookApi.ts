import { useSyncExternalStore } from 'react'

import type { DataPath, ListItem, ListPath, ValueAt } from '../types'

import { useFormContext } from '../context'
import { addItem, change, removeItem } from '../reducer'

export interface HooksFor<Data> {
  useValueAt: <Path extends string>(path: Path) => ValueAt<Data, Path>
  useChangeAt: <Path extends string>(path: Path) => (value: ValueAt<Data, Path>) => unknown
  useAddItem: () => <Path extends ListPath<Data>>(path: Path, value: ValueAt<Data, `${Path}.${number}`>, index?: number) => unknown
  useAddItemAt: <Path extends ListPath<Data>>(path: Path) => (value: ValueAt<Data, `${Path}.${number}`>, index?: number) => unknown
  useRemoveItem: () => <Path extends ListPath<Data>>(path: Path, index: number) => unknown
  useRemoveItemAt: <Path extends ListPath<Data>>(path: Path) => (index: number) => unknown
}


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

export default {
  useValueAt,
  useChangeAt,
  useAddItem,
  useAddItemAt,
  useRemoveItem,
  useRemoveItemAt,
}
