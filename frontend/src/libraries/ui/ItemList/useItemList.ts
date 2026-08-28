import { BaseItem, ItemListProps } from './types'

import { Column, normalizeColumnInput } from './column'
import { useActionsColumn } from './hooks/useActionsColumn'
import { useColumnVisibility } from './hooks/useColumnVisibility'
import { ItemListSortState, useItemSorting } from './hooks/useItemSorting'
import { useSelectionColumn } from './hooks/useSelectionColumn'

interface ItemListData<T> extends ItemListSortState<T> {
  columns: Column<T>[]
}

export function useItemList<T extends BaseItem, Key>(props: ItemListProps<T, Key>): ItemListData<T> {
  const {
    columns: columnInputs,
    labelTranslator,
    defaultColumnWidth,
  } = props
  const baseColumns = columnInputs
    .map(col => normalizeColumnInput(col, labelTranslator, defaultColumnWidth))
    .filter(c => c.enabled)

  const itemSorting = useItemSorting(baseColumns, props)
  const columnVisibilityApi = useColumnVisibility(props.id, baseColumns)

  let columns = addNonNullAt(columnVisibilityApi.visibleColumns, 0, useSelectionColumn(itemSorting.items, props))
  columns = addNonNullAt(columns, columns.length, useActionsColumn(itemSorting, columnVisibilityApi, props))

  return {
    ...itemSorting,
    columns,
  }
}

const addNonNullAt = <T>(list: T[], position: number, item: T | null): T[] =>
  item == null ? list : list.toSpliced(position, 0, item)
