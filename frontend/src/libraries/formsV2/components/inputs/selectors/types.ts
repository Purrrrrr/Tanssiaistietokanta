import { ReactNode } from 'react'
import type { UseComboboxGetToggleButtonPropsReturnValue } from 'downshift'

import { FieldInputComponentProps } from '../types'

export interface SelectorProps<T> extends FieldInputComponentProps<T, T> {
  items: Items<T>
  filterPlaceholder?: string
  placeholder?: string
  itemToString?: (item: T) => string
  buttonRenderer?: (selectedItem: T, props: DropdownButtonDownshiftProps) => ReactNode
  itemCategory?: (item: T) => string
  categoryTitleRenderer?: (category: string) => ReactNode
  itemRenderer?: (item: T) => ReactNode
  itemIcon?: (item: T) => ReactNode
  containerClassname?: string
  itemClassName?: string
  hilightedItemClassName?: string
  noResultsText?: ReactNode
}

export interface DropdownButtonDownshiftProps extends Omit<UseComboboxGetToggleButtonPropsReturnValue, 'tabIndex'> {
  disabled?: boolean
  'aria-label'?: string
  tabIndex: number
}

export type Items<T> =
  | SyncItems<T>
  | ((filter: string) => Promise<SyncItems<T>> | SyncItems<T>)
export type SyncItems<T> =
  | T[]
  | { categories: ItemCategory<T>[] }
export interface ItemCategory<T> {
  items: T[]
  title: string
}
export type ItemToString<T> = (item: T) => string
export type ValueToString<T> = (item: T | null) => string

export interface InternalItemData<T> {
  showCategories: boolean
  categories: ItemCategory<T>[]
  items: T[]
}
