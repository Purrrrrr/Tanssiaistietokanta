import { ReactNode } from 'react'
import type { UseComboboxGetToggleButtonPropsReturnValue } from 'downshift'

import { FieldInputComponentProps } from '../types'

export interface SelectorProps<T> extends FieldInputComponentProps<T, T> {
  items: Items<T>
  placeholder?: string
  buttonRenderer?: (selectedItem: T | null, props: ButtonProps, valueString: string) => ReactNode
  itemToString?: (item: T) => string
  itemRenderer?: (item: T) => ReactNode
  itemIcon?: (item: T | null) => ReactNode
  itemClassName?: string
  hilightedItemClassName?: string
}

interface ButtonProps extends Omit<UseComboboxGetToggleButtonPropsReturnValue, 'tabIndex'> {
  disabled?: boolean
  'aria-label'?: string
  tabIndex: number
}

export type Items<T> = T[] | ((filter: string) => Promise<T[]> | T[])
export type ItemToString<T> = (item: T) => string
export type ValueToString<T> = (item: T | null) => string
