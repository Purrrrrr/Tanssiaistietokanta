import { KeyboardEvent, useRef } from 'react'
import {Classes} from '@blueprintjs/core'
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

import { DropdownButton } from './DropdownButton'
import { Menu, MenuItem, toMenuItemProps } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useFilteredItems } from './utils'

export default function FilterableSelect<T>(props: SelectorProps<T>) {
  'use no memo'
  const {
    items, itemToString = String,
    value, onChange, id, containerClassname,
    filterPlaceholder,
  } = props
  const valueToString = acceptNulls(itemToString)
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
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem as T),
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
  const buttonProps = getToggleButtonProps({
    ref: buttonRef,
    tabIndex: isOpen ? -1 : 0,
  })

  return <DropdownContainer className={containerClassname}>
    <DropdownButton selectorProps={props} buttonProps={buttonProps} />
    <Dropdown open={isOpen} arrow>
      <input
        tabIndex={isOpen ? 0 : -1}
        placeholder={filterPlaceholder}
        className={Classes.INPUT+' w-full'}
        {...getInputProps({ onKeyDown: disableHomeAndEndKeys })}
        onClick={undefined}
      />
      <Menu {...getMenuProps({}, {suppressRefError: true})} tabIndex={-1}>
        {filteredItems.map((item, index) => (
          <MenuItem
            highlight={highlightedIndex === index}
            key={`${item}${index}`}
            {...toMenuItemProps(item, props)}
            {...getItemProps({ item, index })}
          />
        ))}
      </Menu>
    </Dropdown>
  </DropdownContainer>
}

const disableHomeAndEndKeys = preventDownshiftDefaultWhen<KeyboardEvent>(
  e => e.key === 'Home' || e.key === 'End'
)

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
