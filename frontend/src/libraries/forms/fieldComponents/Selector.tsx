import React, {useState} from 'react'
import { Popover } from '@blueprintjs/core'
import { ItemRenderer as BPItemRenderer, QueryList, QueryListProps} from '@blueprintjs/select'

import { Button, ButtonProps, MenuItem, SearchBar } from 'libraries/ui'

import { ActionButton } from '../formControls'

import  './Selector.scss'

type SelectorProps<T> = SelectorMenuProps<T> & {
  text: string
  buttonProps?: Omit<ButtonProps, 'text'>
}
export function Selector<T>({text, buttonProps, onSelect, ...rest} : SelectorProps<T>) {
  const [open, setOpen] = useState(false)
  return <MenuButton
    menu={
      <SelectorMenu onSelect={(item) => { setOpen(false); onSelect(item)}} {...rest} />
    }
    text={text}
    buttonProps={buttonProps}
    open={open}
    onSetOpen={setOpen}
  />
}


interface MenuButtonProps{
  open?: boolean
  onSetOpen?: (open: boolean) => unknown
  alwaysEnabled?: boolean
  text: string
  menu: JSX.Element
  buttonProps?: Omit<ButtonProps, 'text'>
}
export function MenuButton({alwaysEnabled, text, buttonProps, menu, open, onSetOpen} : MenuButtonProps) {
  const ButtonComp = alwaysEnabled ? Button : ActionButton
  return <Popover
    interactionKind="click"
    placement="bottom"
    lazy
    shouldReturnFocusOnClose
    content={menu}
    onOpened={onSelectOpen}
    isOpen={open}
    onInteraction={onSetOpen}
  >
    <ButtonComp text={text} rightIcon="double-caret-vertical" {...buttonProps} />
  </Popover>
}

function onSelectOpen(e: HTMLElement) {
  e.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})

  const menu = e.querySelector('.bp5-menu') as HTMLElement | null
  const selected = e.querySelector('[aria-selected="true"]') as HTMLElement | null

  if (menu && selected) {
    if (selected.offsetTop + selected.offsetHeight > menu.offsetHeight) {
      menu.scrollTop = selected.offsetTop
    }
  }

  const itemList = e.querySelector('.selector-item-list > input, .selector-item-list') as HTMLElement
  const input = itemList?.querySelector?.('input');
  (input ?? itemList)?.focus()
}

type SelectorMenuProps<T> = {
  items: T[] | (() => T[])
  itemPredicate?: QueryListProps<T>['itemPredicate']
  selectedItem?: T
  onSelect: (t: T) => unknown
  getItemText: ((t: T) => string | JSX.Element) | null
  itemRenderer?: ItemRenderer<T>
} & (
{
  filterable: true
  searchPlaceholder: string
  emptySearchText: string
} | {
  filterable?: false
  searchPlaceholder?: string
  emptySearchText?: string
}

)
type ItemRenderer<T> = (text: string | JSX.Element | undefined, ...rest: Parameters<BPItemRenderer<T>>) => ReturnType<BPItemRenderer<T>>
export function SelectorMenu<T>({items, itemPredicate, selectedItem, getItemText, onSelect, filterable, searchPlaceholder, emptySearchText, itemRenderer = defaultItemRenderer} : SelectorMenuProps<T>) {
  const [query, setQuery] = useState('')
  return <QueryList<T>
    query={query}
    initialActiveItem={selectedItem}
    items={unwrap(items)}
    itemPredicate={itemPredicate}
    renderer={({className, itemList, handleKeyUp, handleKeyDown}) =>
      <div className={'selector-item-list '+className} tabIndex={0} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown}>
        {filterable && <SearchBar id="selector-query" value={query} onChange={setQuery} placeholder={searchPlaceholder} emptySearchText={emptySearchText} />}
        {itemList}
      </div>
    }
    itemRenderer={(item, ...args) => itemRenderer(getItemText?.(item), item, ...args)}
    onItemSelect={onSelect}
  />
}

const defaultItemRenderer : ItemRenderer<unknown> = function defaultItemRenderer(text, item, {handleClick, index, modifiers: {active}}) {
  return <MenuItem key={index} roleStructure="listoption" text={text} onClick={handleClick} active={active} />
}

function unwrap<T>(items: T[] | (() => T[])): T[] {
  if (typeof items === 'function') return items()
  return items
}
