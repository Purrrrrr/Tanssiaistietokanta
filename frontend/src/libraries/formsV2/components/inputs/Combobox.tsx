import { ReactNode, useState } from 'react'
import {Classes} from '@blueprintjs/core'
import classNames from 'classnames'
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'

import { FieldInputComponentProps } from './types'

import { Button } from 'libraries/ui'

interface ComboboxProps<T> extends FieldInputComponentProps<T | null> {
  items: T[]
  placeholder?: string
  itemToString?: (item: T) => string
  renderItem: (item: T) => ReactNode
}

export function Combobox<T>({
  items, itemToString = String, renderItem,
  value, onChange, id, readOnly,
  placeholder = '',
}: ComboboxProps<T>) {
  'use no memo'
  const [filteredItems, setFilteredItems] = useState<T[]>(items)
  const selectionToStr = toDownShiftItemToString(itemToString)
  const selected = value ?? null
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
    selectedItem: selected,
    onSelectedItemChange: ({ selectedItem }) => {
      onChange(selectedItem)
    },
    onInputValueChange: ({ inputValue}) => {
      setFilteredItems(items.filter(item => selectionToStr(item).includes(inputValue)))
    },
    stateReducer: supplementaryReducer,
    itemToString: selectionToStr,
  })

  if (readOnly) {
    return <div>
      {value ? renderItem(value) : placeholder}
    </div>
  }

  return <div
    className="flex"
    style={{
      flexDirection: 'column',
      width: 'fit-content',
      justifyContent: 'center',
      marginTop: 100,
      alignSelf: 'center',
    }}
  >
    <Button
      aria-label="toggle menu"
      {...getToggleButtonProps()}
    >
      {value ? renderItem(value) : placeholder}
      {isOpen ? <>&#8593;</> : <>&#8595;</>}
    </Button>
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
    <div className={classNames(
      isOpen ? 'block' : 'hidden',
      'border'
    )}>
      <ul
        {...getMenuProps()}
        style={{
          width: '100%',
          padding: '0',
          margin: '4px 0 0 0',
        }}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              style={{
                padding: '4px',
                backgroundColor: highlightedIndex === index ? '#bde4ff' : undefined,
              }}
              key={`${item}${index}`}
              {...getItemProps({
                item,
                index,
              })}
            >
              {renderItem(item)}
            </li>
          ))}
      </ul>
    </div>
  </div>
}

function toDownShiftItemToString<T>(
  itemToString: (item: T) => string
): ((item: T | null) => string) {
  return item => item ? itemToString(item) : ''
}

function supplementaryReducer<T>(_state: UseComboboxState<T>, { type, changes }: UseComboboxStateChangeOptions<T>): Partial<UseComboboxState<T>> {
  console.log(type, changes)
  switch (type) {
    case useCombobox.stateChangeTypes.InputKeyDownEscape:
      return {
        isOpen: false,
      }
  }
  return changes
}
