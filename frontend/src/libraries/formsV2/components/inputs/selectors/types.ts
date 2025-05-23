import { ReactNode } from 'react'

import { FieldInputComponentProps } from '../types'

export interface SelectorProps<T> extends FieldInputComponentProps<T | null> {
  items: Items<T>
  placeholder?: string
  itemToString?: (item: T) => string
  itemIcon?: (item: T | null) => ReactNode
}

export type Items<T> = T[] | ((filter: string) => Promise<T[]> | T[])
export type ItemToString<T> = (item: T) => string
export type ValueToString<T> = (item: T | null) => string
