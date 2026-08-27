import { useState } from 'react'

import { SelectionApi } from './types'

type ID = string | number

export function useMultipleSelection<T extends { _id: ID }>(
  allItems: T[],
): SelectionApi<T> {
  const [selected, setSelected] = useState<ID[]>([])
  const isSelected = (item: T) => selected.includes(item._id)
  const allSelected = !allItems.find(item => !isSelected(item))

  return {
    selected: allItems.filter(isSelected),
    setSelectedItems: (newSelected: T[]) => setSelected(newSelected.map(item => item._id)),
    clearSelection: () => setSelected([]),
    selectAllProps: {
      checked: allSelected,
      onChange: () => setSelected(allSelected ? [] : allItems.map(item => item._id)),
    },
    selectItemProps: (item: T) => ({
      checked: isSelected(item),
      onChange: () => setSelected(
        isSelected(item)
          ? selected.filter(i => i !== item._id)
          : [...selected, item._id],
      ),
    }),
  }
}
