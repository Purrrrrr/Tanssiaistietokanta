import { useCombobox } from 'downshift'

import { SelectorProps } from './types'
import { FieldInputComponent } from '../types'

import { Dropdown, DropdownContainer } from 'libraries/overlays'
import { CssClass } from 'libraries/ui'

import { Menu, MenuItem, toMenuItemProps } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useFilteredItems } from './utils'

export interface AutocompleteInputProps<T> extends Omit<SelectorProps<T>, 'buttonRenderer'> {
  placeholder?: string
}

export function AutocompleteInput<T>(props: AutocompleteInputProps<T>) {
  'use no memo'
  const {
    items, itemToString = String,
    value, onChange, id, readOnly,
    placeholder = '', containerClassname, inline,
  } = props
  const valueToString = acceptNulls(itemToString)
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
    defaultHighlightedIndex: 0,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem as T),
    onInputValueChange: async ({ inputValue}) => updateFilter(inputValue),
    onIsOpenChange: async (a) => {
      if (a.isOpen) {
        updateFilter(valueToString(value))
      }
    },
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputClick:
          return state
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

  const inputProps = {
    placeholder,
    onFocus: openMenu,
    disabled: readOnly,
    ...getInputProps({
      onKeyDown: preventDownshiftDefaultWhen(e => e.key === 'Home' || e.key === 'End')
    })
  }

  return <DropdownContainer className={containerClassname ?? (inline ? undefined : 'grow f-full')}>
    <input className={CssClass.input+' w-full'} {...inputProps} />
    <Dropdown open={isOpen} tabIndex={-1}>
      <Menu {...getMenuProps({}, { suppressRefError: true })} tabIndex={-1}>
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

export function autocompleteWithType<T>(): FieldInputComponent<T, AutocompleteInputProps<T>, T> {
  return AutocompleteInput as FieldInputComponent<T, AutocompleteInputProps<T>, T>
}

AutocompleteInput.withType = autocompleteWithType
