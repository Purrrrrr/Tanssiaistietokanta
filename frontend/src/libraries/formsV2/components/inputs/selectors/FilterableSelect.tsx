import { useRef } from 'react'
import {Classes} from '@blueprintjs/core'
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownButton, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useFilteredItems } from './utils'

export function FilterableSelect<T>({
  items, itemToString = String, itemIcon, itemRenderer,
  value = null, onChange, id, readOnly,
  placeholder = '', 'aria-label': ariaLabel,
  itemClassName, hilightedItemClassName,
}: SelectorProps<T>) {
  'use no memo'
  const valueToString = acceptNulls(itemToString, placeholder)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [filteredItems, updateFilter] = useFilteredItems(items, itemToString)
  const {
    isOpen,
    getInputProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    setHighlightedIndex,
  } = useCombobox({
    id,
    inputId: id,
    items: filteredItems,
    selectedItem: value,
    itemToString: valueToString,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    onInputValueChange: async ({ inputValue}) => {
      // Try to keep the hilighted item the same
      const previousHilight = filteredItems[highlightedIndex]
      const newItems = await updateFilter(inputValue)
      const nextHilightedIndex = newItems.indexOf(previousHilight)
      setHighlightedIndex(nextHilightedIndex > -1 ? nextHilightedIndex : 0)
    },
    onIsOpenChange: async (a) => {
      if (!a.isOpen && a.type !== useCombobox.stateChangeTypes.InputBlur) {
        setTimeout(() => buttonRef.current?.focus?.(), 150)
      }
      if (a.isOpen) {
        updateFilter('')
      }
    },
    stateReducer: clearInputOnBlurReducer,
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

function clearInputOnBlurReducer<T>(state: UseComboboxState<T>, { type, changes }: UseComboboxStateChangeOptions<T>): Partial<UseComboboxState<T>> {
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
        selectedItem: state.selectedItem,
        isOpen: false,
        inputValue: '',
      }
  }
  return changes
}
