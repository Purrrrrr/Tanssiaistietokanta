import { useSelect } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownButton, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useItems } from './utils'

export function Select<T>({
  items: getItems, itemToString = String, itemIcon,
  value = null, onChange, id, readOnly,
  placeholder = '', 'aria-label': ariaLabel,
}: SelectorProps<T>) {
  'use no memo'
  const valueToString = acceptNulls(itemToString, placeholder)
  const [items, updateItems] = useItems(getItems)
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
    itemToString: valueToString,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    onIsOpenChange: async (a) => {
      if (a.isOpen) {
        updateItems()
      }
    },
  })

  return <DropdownContainer>
    <DropdownButton
      {...getToggleButtonProps({ onClick: preventDownshiftDefaultWhen(e => e.detail === 0) })}
      label={ariaLabel}
      chosenValue={valueToString(value)}
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
