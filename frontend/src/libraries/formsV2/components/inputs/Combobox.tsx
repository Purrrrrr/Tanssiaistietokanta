import { ReactNode, useState } from 'react'
import { useCombobox } from 'downshift'

import { FieldInputComponentProps } from './types'

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
  const [search, setSearch] = useState('')
  const {
    isOpen,
    getInputProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selectItem,
  } = useCombobox({
    id,
    inputId: id,
    items,
    selectedItem: value,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    itemToString: toDownShiftItemToString(itemToString, placeholder),
  })

  if (readOnly) {
    return <div>
      {value ? renderItem(value) : placeholder}
    </div>
  }

  const filteredItems = items

  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: 'fit-content',
      justifyContent: 'center',
      marginTop: 100,
      alignSelf: 'center',
    }}
  >
    <button
      style={{padding: '4px 8px'}}
      aria-label="toggle menu"
      {...getToggleButtonProps()}
    >
      {value ? renderItem(value) : placeholder}
      {isOpen ? <>&#8593;</> : <>&#8595;</>}
    </button>
    <div style={{display: isOpen ? 'block' : 'none'}}>
      <input
        placeholder={placeholder}
        {...getInputProps()}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button
        style={{padding: '4px 8px'}}
        aria-label="toggle menu"
        data-testid="clear-button"
        onClick={() => selectItem(null)}
      >
        &#10007;
      </button>
      <ul
        {...getMenuProps()}
        style={{
          listStyle: 'none',
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
  itemToString: ((item: T) => string) | undefined, placeholder: string
): ((item: T | null) => string) | undefined {
  if (itemToString) {
    return item => item ? itemToString(item) : placeholder
  }
  return undefined
}
