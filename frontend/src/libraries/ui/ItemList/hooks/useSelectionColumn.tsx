import { SelectionApi } from 'libraries/common/selection/types'

import { Column, columnDefaults } from '../column'
import { SelectionBox } from '../SelectionBox'

export interface SelectorColumnProps<T> {
  selection?: Selector<T> | null
  selectorColumnClassName?: string
}

export type Selector<T> = Pick<SelectionApi<T>, 'selected' | 'setSelectedItems' | 'selectAllProps' | 'selectItemProps'>
type Id = string | number

export function useSelectionColumn<T extends { _id: Id }>(
  items: T[],
  { selection, selectorColumnClassName }: SelectorColumnProps<T>,
): Column<T> | null {
  if (!selection) return null

  return {
    ...columnDefaults,
    link: null,
    width: 'max-content',
    id: 'itemlist-selection',
    label: <SelectionBox {...selection.selectAllProps} />,
    content: item => <SelectionBox {...selection.selectItemProps(item, items)} />,
    headerPaddingClassName: 'selector',
    className: selectorColumnClassName ?? 'selector',
  }
}
