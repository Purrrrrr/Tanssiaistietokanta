import { ReactNode } from 'react'
import { type UseComboboxGetInputPropsOptions, useCombobox } from 'downshift'

import type { SelectorProps } from './types'
import type { FieldInputComponent } from '../types'

import { Dropdown, DropdownContainer } from 'libraries/overlays'
import { CssClass } from 'libraries/ui'

import { Menu, MenuItem, renderMenuItems, toMenuItemProps } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useFilteredItems } from './utils'

export interface AutocompleteInputProps<T> extends Omit<SelectorProps<T>, 'buttonRenderer'> {
  placeholder?: string
  inputRenderer?: (props: InputProps) => ReactNode
}

interface InputProps extends Omit<UseComboboxGetInputPropsOptions, 'onChange'> {
  placeholder: string
  disabled?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export function AutocompleteInput<T>(props: AutocompleteInputProps<T>) {
  'use no memo'
  const {
    items, itemToString = String, categoryTitleRenderer, inputRenderer,
    value, onChange, id, readOnly,
    placeholder = '', containerClassname, inline,
  } = props
  const valueToString = acceptNulls(itemToString)
  const [filteredItemData, updateFilter] = useFilteredItems(items, itemToString)
  const {
    isOpen,
    getInputProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    openMenu,
    setHighlightedIndex,
  } = useCombobox({
    id,
    inputId: id,
    items: filteredItemData.items,
    selectedItem: value,
    itemToString: valueToString,
    defaultHighlightedIndex: 0,
    onSelectedItemChange: ({ selectedItem }) => {
      onChange(selectedItem as T)
    },
    onInputValueChange: async ({ inputValue}) => {
      // Try to keep the hilighted item the same
      const previousHilight = filteredItemData[highlightedIndex]
      const newItems = await updateFilter(inputValue)
      const nextHilightedIndex = newItems.items.indexOf(previousHilight)
      setHighlightedIndex(nextHilightedIndex > -1 ? nextHilightedIndex : 0)
    },
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
            selectedItem: value,
          }
        case useCombobox.stateChangeTypes.InputKeyDownEscape:
          return {
            isOpen: false,
            inputValue: valueToString(value ?? state.selectedItem),
            selectedItem: value,
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
    {inputRenderer
      ? inputRenderer(inputProps)
      : <input className={CssClass.input+' w-full'} {...inputProps} />
    }
    <Dropdown open={isOpen} tabIndex={-1}>
      <Menu {...getMenuProps({}, { suppressRefError: true })} tabIndex={-1}>
        {renderMenuItems(filteredItemData, categoryTitleRenderer, (item, index) => (
          <MenuItem
            highlight={highlightedIndex === index}
            key={`${itemToString(item)}${index}`}
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
