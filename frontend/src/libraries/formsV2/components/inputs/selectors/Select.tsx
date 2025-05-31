import { ReactNode } from 'react'
import { useSelect } from 'downshift'

import { FieldInputComponentProps } from '../types'

import { Button } from 'libraries/ui'

import { Dropdown, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'

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
  const {
    isOpen:a,
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
    itemToString: toDownShiftItemToString(itemToString),
  })
  const isOpen = a // true

  if (readOnly) {
    return <div>
      {itemIcon?.(value)}
      {value ? itemToString(value) : placeholder}
    </div>
  }

  return <DropdownContainer>
    <Button
      aria-label="toggle menu"
      {...getToggleButtonProps({
        onClick: e => {
          if (e.detail === 0) {
            (e as unknown as Record<string, boolean>).preventDownshiftDefault = true
          }
        },
      })}
      tabIndex={isOpen ? -1 : 0}
      rightIcon="double-caret-vertical"
    >
      {itemIcon?.(value)}
      {value ? itemToString(value) : placeholder}
    </Button>
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

function toDownShiftItemToString<T>(
  itemToString: (item: T) => string
): ((item: T | null) => string) {
  return item => item ? itemToString(item) : ''
}
