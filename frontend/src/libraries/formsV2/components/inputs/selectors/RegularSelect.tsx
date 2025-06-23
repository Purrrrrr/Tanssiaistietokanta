import { useSelect } from 'downshift'

import { SelectorProps } from './types'

import { Dropdown, DropdownContainer } from 'libraries/overlays'

import { DropdownButton } from './DropdownButton'
import { Menu, MenuItem, renderMenuItems, toMenuItemProps } from './Menu'
import { acceptNulls, preventDownshiftDefaultWhen, useItems } from './utils'

export default function RegularSelect<T>(props: SelectorProps<T>) {
  'use no memo'
  const {
    items: getItems, itemToString = String, categoryTitleRenderer,
    value, onChange, id, containerClassname,
  } = props
  const valueToString = acceptNulls(itemToString)
  const [itemData, updateItems] = useItems(getItems)
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useSelect({
    id,
    items: itemData.items,
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
    <Dropdown open={isOpen} arrow tabIndex={-1}>
      <Menu {...getMenuProps({}, {suppressRefError: true})} tabIndex={-1}>
        {renderMenuItems(itemData, categoryTitleRenderer, (item, index) => (
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
