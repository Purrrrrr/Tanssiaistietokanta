import { useState } from 'react'

import { SelectionApi } from './types'

import { uniq } from 'utils/uniq'

type ID = string | number

export function useMultipleSelection<T extends { _id: ID }>(
  allItems: T[],
): SelectionApi<T> {
  const [selected, setSelected] = useState<ID[]>([])
  const [lastToggledItemId, setLastToggledItemId] = useState<ID | null>(null)
  const isSelected = (item: T) => selected.includes(item._id)
  const allSelected = !allItems.find(item => !isSelected(item))

  return {
    selected: allItems.filter(isSelected),
    setSelectedItems: (newSelected: T[]) => setSelected(newSelected.map(item => item._id)),
    isSelected,
    clearSelection: () => setSelected([]),
    selectAllProps: {
      checked: allSelected,
      onChange: () => {
        setLastToggledItemId(null)
        setSelected(allSelected ? [] : allItems.map(item => item._id))
      },
    },
    selectItemProps: (item: T, orderedAllItems?: T[]) => ({
      checked: isSelected(item),
      onChange: (checked) => {
        setLastToggledItemId(item._id)
        setSelected(
          checked
            ? [...selected, item._id]
            : selected.filter(i => i !== item._id),
        )
      },
      onChangeMultiple: (checked) => {
        setLastToggledItemId(item._id)
        const items = orderedAllItems ?? allItems
        setSelected(toggleMultiple(selected, getRange(items.map(item => item._id), lastToggledItemId ?? item._id, item._id), checked))
      },
    }),
  }
}

function getRange(items: ID[], itemId: ID, item: ID): ID[] {
  const indexA = items.indexOf(itemId)
  const indexB = items.indexOf(item)
  if (indexA === -1 || indexB === -1) return []
  const [start, end] = indexA < indexB ? [indexA, indexB] : [indexB, indexA]
  return items.slice(start, end + 1)
}

function toggleMultiple<T>(selected: T[], toggledItems: T[], checked: boolean): T[] {
  if (checked) {
    return uniq([...selected, ...toggledItems])
  } else {
    return selected.filter(item => !toggledItems.includes(item))
  }
}
