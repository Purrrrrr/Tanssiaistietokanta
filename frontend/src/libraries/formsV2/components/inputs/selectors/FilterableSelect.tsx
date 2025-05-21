import { ReactNode, useRef, useState } from 'react'
import {Classes} from '@blueprintjs/core'
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'

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

export function FilterableSelect<T>({
  items, itemToString = String, itemIcon,
  value = null, onChange, id, readOnly,
  placeholder = '', 'aria-label': ariaLabel,
}: ComboboxProps<T>) {
  'use no memo'
  const valueToString = acceptNulls(itemToString, placeholder)
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
      setFilteredItems(items.filter(item => valueToString(item).includes(inputValue)))
    },
    onIsOpenChange: (a) => {
      if (!a.isOpen && a.type !== useCombobox.stateChangeTypes.InputBlur) {
        setTimeout(() => buttonRef.current?.focus?.(), 150)
      }
    },
    stateReducer: supplementaryReducer,
    itemToString: valueToString,
  })

  return <DropdownContainer>
    <DropdownButton
      {...getToggleButtonProps({ ref: buttonRef })} tabIndex={isOpen ? -1 : 0} disabled={readOnly}
      label={ariaLabel}
      chosenValue={valueToString(value)}
    >
      {itemIcon?.(value)}
      {valueToString(value)}
    </DropdownButton>
    <Dropdown open={isOpen}>
      <input
        className={Classes.INPUT}
        {...getInputProps({
          onKeyDown: preventDownshiftDefaultWhen(e => e.key === 'Home' || e.key === 'End')
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
              {valueToString(item)}
            </MenuItem>
          ))}
      </Menu>
    </Dropdown>
  </DropdownContainer>
}

function supplementaryReducer<T>(_state: UseComboboxState<T>, { type, changes }: UseComboboxStateChangeOptions<T>): Partial<UseComboboxState<T>> {
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
