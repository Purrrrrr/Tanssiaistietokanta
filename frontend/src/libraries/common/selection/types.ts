export interface SelectionApi<T> {
  selected: T[]
  setSelectedItems: (selected: T[]) => void
  clearSelection: () => void
  selectAllProps: SelectorProps
  selectItemProps: (item: T) => SelectorProps
}

export interface SelectorProps {
  checked: boolean
  onChange: () => void
}
