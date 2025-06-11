import { useSelect } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownContainer } from './Dropdown'
import { DropdownButton } from './DropdownButton'
import { Menu, MenuItem, toMenuItemProps } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useItems } from './utils'

export default function RegularSelect<T>(props: SelectorProps<T>) {
  'use no memo'
  const {
    items: getItems, itemToString = String,
    value, onChange, id, containerClassname,
  } = props
  const valueToString = acceptNulls(itemToString)
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
  })

  return <DropdownContainer className={containerClassname}>
    <DropdownButton selectorProps={props} buttonProps={buttonProps} />
    <Dropdown open={isOpen} arrow>
      <Menu {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
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
