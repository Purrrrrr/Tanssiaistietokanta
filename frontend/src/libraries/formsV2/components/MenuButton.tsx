import { createLink } from '@tanstack/react-router'
import { MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'

import { omitPermissionCheckingProps, withPermissionChecking } from 'libraries/access-control'
import { Dropdown, DropdownContainer, getFocusableElements } from 'libraries/overlays'
import { Button, ButtonProps } from 'libraries/ui'
import { DoubleCaretVertical } from 'libraries/ui/icons'

interface MenuButtonProps {
  children: ReactNode
  containerClassname?: string
  text?: string
  buttonRenderer?: (props: { active: boolean, children: ReactNode, popoverTarget: string }) => ReactNode
  buttonProps?: ButtonProps
}

export default function MenuButton({ children, buttonRenderer, text, buttonProps, containerClassname }: MenuButtonProps) {
  'use no memo'
  const dropdownId = useId()
  const [open, setOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const onClick = (e: MouseEvent) => {
    // Refine this to actually work with other stuff
    if ((e.target as HTMLElement).closest('button, a[href]')) {
      setOpen(false)
    }
  }
  useEffect(() => {
    if (open) {
      const dropdown = document.getElementById(dropdownId)
      if (dropdown) {
        getFocusableElements(dropdown)[0]?.focus()
      }
    }
  }, [open, dropdownId])

  return <DropdownContainer className={containerClassname} ref={containerRef}>
    {buttonRenderer
      ? buttonRenderer({ active: open, children: text, popoverTarget: dropdownId })
      : (
        <Button
          active={open}
          rightIcon={<DoubleCaretVertical />}
          text={text}
          popoverTarget={dropdownId}
          {...buttonProps}
        />
      )
    }
    <Dropdown focusgroup="menu" auto arrow id={dropdownId} open={open} onClick={onClick} onToggle={setOpen}>
      {children}
    </Dropdown>
  </DropdownContainer>
}

const menuItemClass = 'flex gap-2 items-center px-2 min-h-7.5 transition-colors hover:bg-blue-200 focus:bg-blue-200 focus-visible:outline-none!'

interface MenuItemLinkProps extends React.ComponentProps<'a'> {
  text?: React.ReactNode
  icon?: React.ReactNode
}

const MenuItemLink = createLink(withPermissionChecking(({ children, href, text, icon, ...props }: MenuItemLinkProps) => {
  return <a {...omitPermissionCheckingProps(props)} className={menuItemClass} href={href}>
    {icon}
    {text}
    {children}
  </a>
}))

interface MenuItemButtonProps extends Omit<React.ComponentProps<'button'>, 'text'> {
  text?: React.ReactNode
  icon?: React.ReactNode
}

const MenuItemButton = withPermissionChecking(({ children, text, icon, ...props }: MenuItemButtonProps) => {
  return <button {...omitPermissionCheckingProps(props)} className={menuItemClass}>
    {icon}
    {text}
    {children}
  </button>
})

MenuButton.ItemLink = MenuItemLink
MenuButton.ItemButton = MenuItemButton
