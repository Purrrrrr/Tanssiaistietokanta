import { BaseItem, ItemListProps } from './types'

import { type Column, normalizeColumnInput } from './column'
import { useActionsColumn } from './hooks/useActionsColumn'
import { ItemListSortState, useItemSorting } from './hooks/useItemSorting'
import { useSelectionColumn } from './hooks/useSelectionColumn'

type ColumnId = string

interface ItemListData<T> extends ItemListState, ItemListSortState<T> {
  columns: Column<T>[]
}

interface ItemListState {
  lastToggledItemId: string | null
  columnVisibility: Record<ColumnId, boolean>[]
}

export function useItemList<T extends BaseItem, Key>(props: ItemListProps<T, Key>): ItemListData<T> {
  const {
    columns: columnInputs,
    labelTranslator,
    defaultColumnWidth,
  } = props
  let columns = columnInputs
    .map(col => normalizeColumnInput(col, labelTranslator, defaultColumnWidth))
    .filter(c => c.enabled)
  const itemSorting = useItemSorting(columns, props)
  columns = addNonNullAt(columns, 0, useSelectionColumn(itemSorting.items, props))
  columns = addNonNullAt(columns, columns.length, useActionsColumn(itemSorting, props))

  return {
    ...itemSorting,
    columns,
    lastToggledItemId: null,
    columnVisibility: [],
  }
}

const addNonNullAt = <T>(list: T[], position: number, item: T | null): T[] =>
  item == null ? list : list.toSpliced(position, 0, item)
