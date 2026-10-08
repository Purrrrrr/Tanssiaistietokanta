import type { ColumnInput } from './column'
import { ActionsColumnProps } from './hooks/useActionsColumn'
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
