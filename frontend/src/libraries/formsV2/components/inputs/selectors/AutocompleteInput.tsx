import {Classes} from '@blueprintjs/core'
import { useCombobox } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useFilteredItems } from './utils'

export function AutocompleteInput<T>({
  items, itemToString = String, itemIcon, itemRenderer,
  value = null, onChange, id,
  placeholder = '',
  itemClassName, hilightedItemClassName,
}: SelectorProps<T>) {
  'use no memo'
  const valueToString = acceptNulls(itemToString, placeholder)
  const [filteredItems, updateFilter] = useFilteredItems(items, itemToString)
  const {
    isOpen,
    getInputProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    openMenu,
  } = useCombobox({
    id,
    inputId: id,
    items: filteredItems,
    selectedItem: value,
    itemToString: valueToString,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    onInputValueChange: async ({ inputValue}) => updateFilter(inputValue),
    onIsOpenChange: async (a) => {
      if (a.isOpen) {
        updateFilter(valueToString(value))
      }
    },
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputBlur:
          if (changes.highlightedIndex !== -1) break
          return {
            isOpen: false,
            inputValue: valueToString(value ?? state.selectedItem),
          }
        case useCombobox.stateChangeTypes.InputKeyDownEscape:
          return {
            isOpen: false,
            inputValue: valueToString(value ?? state.selectedItem),
          }
      }
      return changes
    }
  })

  return <DropdownContainer>
    <input
      placeholder={placeholder}
      className={Classes.INPUT}
      onFocus={openMenu}
      {...getInputProps({
        onKeyDown: preventDownshiftDefaultWhen(e => e.key === 'Home' || e.key === 'End')
      })}
    />
    <Dropdown open={isOpen}>
      <Menu {...getMenuProps()}>
        {isOpen &&
          filteredItems.map((item, index) => (
            <MenuItem highlight={highlightedIndex === index}
              key={`${item}${index}`}
              className={itemClassName}
              hilightedClassName={hilightedItemClassName}
              {...getItemProps({ item, index })}
            >
              {itemIcon?.(item)}
              {(itemRenderer ?? itemToString)(item)}
            </MenuItem>
          ))}
      </Menu>
    </Dropdown>
  </DropdownContainer>
}
