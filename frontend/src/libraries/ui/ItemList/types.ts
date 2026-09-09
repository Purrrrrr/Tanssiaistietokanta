import { ButtonProps } from '../Button'
import type { ColumnInput, RowState } from './column'
import { ItemListSortingProps } from './hooks/useItemSorting'
import { SelectorColumnProps } from './hooks/useSelectionColumn'

export { type SortState } from './hooks/useItemSorting'

export interface BaseItem {
  _id: string | number
}

export interface ItemListProps<T, Key = never> extends RowProps<T>, SelectorColumnProps<T>, ItemListSortingProps<T>, ActionsColumnProps<T>, ReflowProps {
  id?: string
  isTable?: boolean
  className?: string
  marginClass?: string
  labelTranslator?: (key: Key) => string
  columns: ColumnInput<T, Key>[]
  defaultColumnWidth?: string
  emptyText: React.ReactNode
  onLoadMore?: (itemsToLoad: number) => void
}

export interface ActionsColumnProps<T> {
  actions?: false | ActionsColumnOptions<T>['content'] | ActionsColumnOptions<T>
  expandButtonProps?: ButtonProps | ((item: T, state: RowState) => ButtonProps)
}

export interface ActionsColumnOptions<T> {
  content: ((item: T, index: number) => React.ReactNode) | null
  reflowArea?: string
  className?: string
}

export type ReflowProps = {
  [K in keyof ReflowOptions as `reflow${Capitalize<K>}`]?: ReflowOptions[K]
} & {
  reflowAt?: `${number}px` | false
  reflow?: ReflowOptions
}
export interface ReflowOptions {
  at?: `${number}px` | false
  type: 'flex' | 'grid'
  columns?: number | string
  rows?: number | string
  areas?: string[]
}

export interface RowProps<T> {
  rowClassName?: string
  expandableContent?: (item: T, close: () => void) => React.ReactNode
  expandableContentLoadingMessage?: string
}
