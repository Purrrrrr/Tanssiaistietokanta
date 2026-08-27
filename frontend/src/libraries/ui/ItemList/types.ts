import { ButtonProps } from '../Button'
import type { ColumnInput, RowState } from './column'
import { ItemListSortingProps } from './hooks/useItemSorting'
import { SelectorColumnProps } from './hooks/useSelectionColumn'

export { type SortState } from './hooks/useItemSorting'

export interface BaseItem {
  _id: string | number
}

export interface ItemListProps<T, Key = never> extends RowProps<T>, SelectorColumnProps<T>, ItemListSortingProps<T>, ActionsColumnProps<T> {
  id?: string
  isTable?: boolean
  reflowAt?: `${number}px` | false
  reflowType?: 'flex' | 'grid'
  reflowColumns?: number | string
  reflowRows?: number | string
  className?: string
  marginClass?: string
  labelTranslator?: (key: Key) => string
  columns: ColumnInput<T, Key>[]
  defaultColumnWidth?: string
  emptyText: React.ReactNode
}

export interface ActionsColumnProps<T> {
  actions?: false | ((item: T, index: number) => React.ReactNode)
  actionsColumnClassName?: string
  expandButtonProps?: ButtonProps | ((item: T, state: RowState) => ButtonProps)
}

export interface RowProps<T> {
  rowClassName?: string
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
}
