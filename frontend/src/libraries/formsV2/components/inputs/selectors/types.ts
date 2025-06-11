import { ReactNode } from 'react'
import type { UseComboboxGetToggleButtonPropsReturnValue } from 'downshift'

import { FieldInputComponentProps } from '../types'

export interface SelectorProps<T> extends FieldInputComponentProps<T, T> {
  items: Items<T>
  filterPlaceholder?: string
  itemToString?: (item: T ) => string
  buttonRenderer?: (selectedItem: T, props: DropdownButtonDownshiftProps) => ReactNode
  itemRenderer?: (item: T) => ReactNode
  itemIcon?: (item: T ) => ReactNode
  containerClassname?: string
  itemClassName?: string
  hilightedItemClassName?: string
}

export interface DropdownButtonDownshiftProps extends Omit<UseComboboxGetToggleButtonPropsReturnValue, 'tabIndex'> {
  disabled?: boolean
  'aria-label'?: string
  tabIndex: number
}

export type Items<T> = T[] | ((filter: string) => Promise<T[]> | T[])
export type ItemToString<T> = (item: T) => string
export type ValueToString<T> = (item: T | null) => string
