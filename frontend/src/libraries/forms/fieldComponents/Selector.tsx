import React, {useState} from 'react'
import { Popover2 } from '@blueprintjs/popover2'
import { ItemRenderer as BPItemRenderer, QueryList, QueryListProps} from '@blueprintjs/select'

import { Button, ButtonProps, MenuItem, SearchBar } from 'libraries/ui'

interface SelectorProps<T> extends SelectorMenuProps<T> {
  text: string
  buttonProps?: Omit<ButtonProps, 'text'>
}
export function Selector<T>({text, buttonProps, items, itemPredicate, selectedItem, getItemText, itemRenderer, onSelect, filterable} : SelectorProps<T>) {
  const [open, setOpen] = useState(false)
  return <MenuButton
    menu={
      <SelectorMenu
        items={items}
        selectedItem={selectedItem}
        itemPredicate={itemPredicate}
        getItemText={getItemText}
        itemRenderer={itemRenderer}
        onSelect={(item) => { setOpen(false); onSelect(item)}}
        filterable={filterable}
      />
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
  text: string
  menu: JSX.Element
  buttonProps?: Omit<ButtonProps, 'text'>
}
export function MenuButton({text, buttonProps, menu, open, onSetOpen} : MenuButtonProps) {
  return <Popover2
    interactionKind="click"
    placement="bottom"
    lazy
    shouldReturnFocusOnClose
    content={menu}
    renderTarget={({ isOpen, ref, ...targetProps }) => (
      <Button elementRef={ref} text={text} rightIcon="double-caret-vertical" {...buttonProps} {...targetProps} />
    )}
    onOpened={onSelectOpen}
    isOpen={open}
    onInteraction={onSetOpen}
  />
}

function onSelectOpen(e: HTMLElement) {
  const itemList = e.querySelector('.selector-item-list > input, .selector-item-list') as HTMLElement
  const input = itemList?.querySelector?.('input');
  (input ?? itemList)?.focus()
}

interface SelectorMenuProps<T>{
  items: T[] | (() => T[])
  itemPredicate?: QueryListProps<T>['itemPredicate']
  selectedItem?: T
  onSelect: (t: T) => unknown
  filterable?: boolean
  getItemText: ((t: T) => string | JSX.Element) | null
  itemRenderer?: ItemRenderer<T>
}
type ItemRenderer<T> = (text: string | JSX.Element | undefined, ...rest: Parameters<BPItemRenderer<T>>) => ReturnType<BPItemRenderer<T>>
export function SelectorMenu<T>({items, itemPredicate, selectedItem, getItemText, onSelect, filterable, itemRenderer = defaultItemRenderer} : SelectorMenuProps<T>) {
  const [query, setQuery] = useState('')
  return <QueryList<T>
    query={query}
    initialActiveItem={selectedItem}
    items={unwrap(items)}
    itemPredicate={itemPredicate}
    renderer={({className, itemList, handleKeyUp, handleKeyDown}) =>
      <div className={'selector-item-list '+className} tabIndex={0} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown}>
        {filterable && <SearchBar id="selector-query" value={query} onChange={setQuery} placeholder="Hae..."/>}
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
