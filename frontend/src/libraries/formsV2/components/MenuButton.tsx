import { MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Button, ButtonProps } from '@blueprintjs/core'
import { UseComboboxGetToggleButtonPropsReturnValue } from 'downshift'

import { getFocusableElements } from 'libraries/dialog'
import { Dropdown, DropdownContainer } from 'libraries/overlays'

interface MenuButtonProps {
  children: ReactNode
  containerClassname?: string
  text?: string
  buttonRenderer?: (props: Omit<UseComboboxGetToggleButtonPropsReturnValue, 'tabIndex'>) => ReactNode
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
      ? null //buttonRenderer(downshiftButtonProps)
      : <Button
        active={open}
        rightIcon="double-caret-vertical"
        text={text}
        popovertarget={dropdownId}
        {...buttonProps}
      />
    }
    <Dropdown auto arrow id={dropdownId} open={open} onClick={onClick} onToggle={setOpen}>
      {children}
    </Dropdown>
  </DropdownContainer>
}
