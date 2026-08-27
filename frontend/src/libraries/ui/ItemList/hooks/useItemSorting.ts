import { useState } from 'react'

import { type Sort, type SortDirection, sortedBy } from 'utils/sorted'

import { type Column } from '../column'

export interface SortState {
  key: string | number
  direction: SortDirection
}

export interface ItemListSortingProps<T> {
  items: T[] | null | undefined
  defaultSort?: SortState | string | null
  alwaysSortBy?: Sort<T> | null
}

export interface ItemListSortState<T> {
  items: T[]
  sortableColumns: Column<T>[]
  sort: SortState | null
  setSort: (sort: SortState | null) => void
}

export function useItemSorting<T>(
  columns: Column<T>[],
  { items, defaultSort, alwaysSortBy }: ItemListSortingProps<T>,
): ItemListSortState<T> {
  const sortableColumns = columns.filter(c => c.enabled && c.sortBy)

  const [sort, setSort] = useState<SortState | null>(() => {
    if (typeof defaultSort === 'object') {
      return defaultSort
    }
    const column = defaultSort ? sortableColumns.find(c => c.id === defaultSort) : sortableColumns[0]
    return column ? { key: column.id, direction: 'asc' as const } : null
  })
  const sortedItems = getSortedItems({ items, columns, sort, alwaysSortBy })

  return { items: sortedItems, sortableColumns, sort, setSort }
}

function getSortedItems<T>({ items: maybeItems, columns, sort, alwaysSortBy }: Pick<ItemListSortingProps<T>, 'items' | 'alwaysSortBy'> & {
  sort: SortState | null
  columns: Column<T>[]
}) {
  const items = maybeItems ?? []
  if (sort) {
    const sortBy = columns.find(c => c.id === sort.key)?.sortBy
    if (sortBy) {
      const sorting: Sort<T> = { key: sortBy, direction: sort.direction }
      return sortedBy(items, sorting, alwaysSortBy ?? [])
    }
  }
  if (alwaysSortBy != null) {
    return sortedBy(items, alwaysSortBy)
  }
  return items
}
