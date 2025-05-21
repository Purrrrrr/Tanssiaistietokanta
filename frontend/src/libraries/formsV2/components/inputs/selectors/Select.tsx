import { ReactNode } from 'react'
import { useSelect } from 'downshift'

import { FieldInputComponentProps } from '../types'

import { Dropdown, DropdownButton, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen } from './utils'

interface ComboboxProps<T> extends FieldInputComponentProps<T | null> {
  items: T[]
  placeholder?: string
  itemToString?: (item: T) => string
  itemIcon?: (item: T | null) => ReactNode
}

export function Select<T>({
  items, itemToString = String, itemIcon,
  value = null, onChange, id, readOnly,
  placeholder = ''
}: ComboboxProps<T>) {
  'use no memo'
  const valueToString = acceptNulls(itemToString, placeholder)
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useSelect({
    id,
    items,
    selectedItem: value,
    onSelectedItemChange: ({ selectedItem }) => {
      onChange(selectedItem)
    },
    stateReducer: (...args) => { console.log(...args); return args[1].changes },
    itemToString: valueToString,
  })

  return <DropdownContainer>
    <DropdownButton
      {...getToggleButtonProps({ onClick: preventDownshiftDefaultWhen(e => e.detail === 0) })}
      disabled={readOnly}
    >
      {itemIcon?.(value)}
      {valueToString(value)}
    </DropdownButton>
    <Dropdown open={isOpen}>
      <Menu {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <MenuItem
              highlight={highlightedIndex === index}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {itemIcon?.(item)}
              {itemToString(item)}
            </MenuItem>
          ))}
      </Menu>
    </Dropdown>
  </DropdownContainer>
}
