import { useState } from 'react'

import { ID } from 'backend/types'

export function useMultipleSelection<T extends { _id: ID }>(
  allItems: T[],
) {
  const [selected, setSelected] = useState<ID[]>(allItems.map(f => f._id))
  const isSelected = (item: T) => selected.includes(item._id)
  const allSelected = !allItems.find(item => !isSelected(item))

  return {
    selected: allItems.filter(isSelected),
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
