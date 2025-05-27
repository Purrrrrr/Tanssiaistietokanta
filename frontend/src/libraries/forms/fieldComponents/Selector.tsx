import { Popover } from '@blueprintjs/core'

import { Button, ButtonProps } from 'libraries/ui'

import { ActionButton } from '../formControls'

import  './Selector.scss'

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

  const input = e.querySelector?.('input')
  input?.focus()
}
