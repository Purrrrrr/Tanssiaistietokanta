import { useSelect } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownButton, DropdownContainer } from './Dropdown'
import { Menu, MenuItem } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useItems } from './utils'

export default function RegularSelect<T>({
  items: getItems, itemToString = String, itemIcon, itemRenderer, buttonRenderer,
  value, onChange, id, readOnly,
  placeholder = '', 'aria-label': ariaLabel,
  itemClassName, hilightedItemClassName,
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
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem as T),
    onIsOpenChange: async (a) => {
      if (a.isOpen) {
        updateItems()
      }
    },
  })
  const buttonProps = getToggleButtonProps({
    onClick: preventDownshiftDefaultWhen(e => e.detail === 0),
    disabled: readOnly,
    'aria-label': ariaLabel,
  })

  return <DropdownContainer>
    {buttonRenderer
      ? buttonRenderer(value, buttonProps, valueToString(value))
      : <DropdownButton
        {...buttonProps}
        label={ariaLabel}
        chosenValue={valueToString(value)}
      >
        {itemIcon?.(value)}
        {valueToString(value)}
      </DropdownButton>
    }
    <Dropdown open={isOpen}>
      <Menu {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <MenuItem
              highlight={highlightedIndex === index}
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
