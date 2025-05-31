import { ReactNode, useRef, useState } from 'react'
import {Classes} from '@blueprintjs/core'
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'

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

export function FilterableSelect<T>({
  items, itemToString = String, itemIcon,
  value = null, onChange, id, readOnly,
  placeholder = ''
}: ComboboxProps<T>) {
  'use no memo'
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [filteredItems, setFilteredItems] = useState<T[]>(items)
  const {
    isOpen,
    getInputProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    id,
    inputId: id,
    items: filteredItems,
    selectedItem: value,
    defaultInputValue: '',
    onSelectedItemChange: ({ selectedItem }) => {
      onChange(selectedItem)
    },
    onInputValueChange: ({ inputValue}) => {
      setFilteredItems(items.filter(item => itemToString(item).includes(inputValue)))
    },
    onIsOpenChange: (a) => {
      if (!a.isOpen && a.type !== useCombobox.stateChangeTypes.InputBlur) {
        setTimeout(() => buttonRef.current?.focus?.(), 150)
      }
    },
    stateReducer: supplementaryReducer,
    itemToString: toDownShiftItemToString(itemToString),
  })

  if (readOnly) {
    return <div>
      {itemIcon?.(value)}
      {value ? itemToString(value) : placeholder}
    </div>
  }

  return <DropdownContainer>
    <Button
      aria-label="toggle menu"
      {...getToggleButtonProps({ ref: buttonRef })}
      tabIndex={isOpen ? -1 : 0}
      rightIcon="double-caret-vertical"
    >
      {itemIcon?.(value)}
      {value ? itemToString(value) : placeholder}
    </Button>
    <Dropdown open={isOpen}>
      <input
        className={Classes.INPUT}
        placeholder={placeholder}
        {...getInputProps({
          onKeyDown: e => {
            if (e.key === 'Home' || e.key === 'End') {
              (e as unknown as Record<string, boolean>).preventDownshiftDefault = true
            }
          }
        })}
      />
      <Menu {...getMenuProps()}>
        {isOpen &&
          filteredItems.map((item, index) => (
            <MenuItem highlight={highlightedIndex === index}
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

function supplementaryReducer<T>(_state: UseComboboxState<T>, { type, changes }: UseComboboxStateChangeOptions<T>): Partial<UseComboboxState<T>> {
  console.log(type, changes)
  switch (type) {
    case useCombobox.stateChangeTypes.ItemClick:
    case useCombobox.stateChangeTypes.InputBlur:
    case useCombobox.stateChangeTypes.InputKeyDownEnter:
    case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
      return {
        ...changes,
        inputValue: '',
      }
    case useCombobox.stateChangeTypes.InputKeyDownEscape:
      return {
        isOpen: false,
        inputValue: '',
      }
  }
  return changes
}
