import { Column, ColumnId } from '../column'
import { useStoredState } from './useStoredState'

export interface ColumnVisibilityApi<T> {
  toggleableColumns: Column<T>[]
  visibleColumns: Column<T>[]
  isColumnVisible: (column: Column<T>) => boolean
  toggleColumnVisibility: (column: Column<T>) => void
}

type ColumnVisibilityState = Record<ColumnId, 0 | 1>

export function useColumnVisibility<T>(
  storageId: string | undefined,
  columns: Column<T>[],
): ColumnVisibilityApi<T> {
  const [visibleIds, setVisibleIds] = useStoredState<ColumnVisibilityState>(storageId, 'visibleColumns', {})
  const isColumnVisible = (column: Column<T>) =>
    column.id in visibleIds
      ? visibleIds[column.id] === 1
      : column.visibility !== 'hidden'

  return {
    visibleColumns: columns.filter(isColumnVisible),
    toggleableColumns: columns.filter(c => c.visibility !== 'always'),
    isColumnVisible,
    toggleColumnVisibility: (column: Column<T>) => {
      if (column.visibility === 'always') return

      setVisibleIds((prev: ColumnVisibilityState) => {
        if (isColumnVisible(column)) {
          return { ...prev, [column.id]: 0 as const }
        } else {
          return { ...prev, [column.id]: 1 as const }
        }
      })
    },
  }
}
