import { SelectionBoxProps } from 'libraries/ui/ItemList/SelectionBox'

export interface SelectionApi<T> {
  selected: T[]
  setSelectedItems: (selected: T[]) => void
  clearSelection: () => void
  isSelected: (item: T) => boolean
  selectAllProps: SelectionBoxProps
  selectItemProps: (item: T, orderedItems?: T[]) => Required<SelectionBoxProps>
}
