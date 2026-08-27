import { ChangeEvent, useState } from 'react'

import { SelectionApi } from 'libraries/common/selection/types'

import { uniq } from 'utils/uniq'

import { Column, columnDefaults } from '../column'
import { SelectionBox } from '../SelectionBox'

export interface SelectorColumnProps<T> {
  selection?: Selector<T> | null
  selectorColumnClassName?: string
}

type Selector<T> = Pick<SelectionApi<T>, 'selected' | 'setSelectedItems' | 'selectAllProps' | 'selectItemProps'>
type Id = string | number

export function useSelectionColumn<T extends { _id: Id }>(
  items: T[],
  { selection, selectorColumnClassName }: SelectorColumnProps<T>,
): Column<T> | null {
  const [lastToggledItemId, setLastToggledItemId] = useState<Id | null>(null)
  if (!selection) return null

  return {
    ...columnDefaults,
    link: null,
    width: 'max-content',
    id: 'itemlist-selection',
    label: <SelectionBox {...selection.selectAllProps} />,
    content: item => {
      const { checked, onChange: toggle } = selection.selectItemProps(item)
      const onChange = ({ nativeEvent }: ChangeEvent) => {
        setLastToggledItemId(item._id)
        if ('shiftKey' in nativeEvent && nativeEvent.shiftKey) {
          toggleMultiple(selection, getRange(items, lastToggledItemId ?? item._id, item), !checked)
        } else {
          toggle()
        }
      }
      return <SelectionBox checked={checked} onChange={onChange} />
    },
    headerPaddingClassName: 'selector',
    className: selectorColumnClassName ?? 'selector',
  }
}

function getRange<T extends { _id: Id }>(items: T[], itemId: Id, item: T): T[] {
  const indexA = items.findIndex(i => i._id === itemId)
  const indexB = items.indexOf(item)
  if (indexA === -1 || indexB === -1) return []
  const [start, end] = indexA < indexB ? [indexA, indexB] : [indexB, indexA]
  return items.slice(start, end + 1)
}

function toggleMultiple<T>(selection: Selector<T>, items: T[], checked: boolean) {
  if (checked) {
    selection.setSelectedItems(uniq([...selection.selected, ...items]))
  } else {
    selection.setSelectedItems(selection.selected.filter(item => !items.includes(item)))
  }
}
