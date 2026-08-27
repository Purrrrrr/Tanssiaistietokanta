import { SelectionApi } from 'libraries/common/selection/types'

import { Column, columnDefaults } from '../column'
import { SelectionBox } from '../SelectionBox'

export interface SelectorColumnProps<T> {
  selection?: Pick<SelectionApi<T>, 'selectAllProps' | 'selectItemProps'> | null
  selectorColumnClassName?: string
}

export function useSelectionColumn<T extends { _id: string | number }>(
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
    content: item => <SelectionBox {...selection.selectItemProps(item)} />,
    headerPaddingClassName: 'selector',
    className: selectorColumnClassName ?? 'selector',
  }
}
