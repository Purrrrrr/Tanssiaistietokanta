import { MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'

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
    <Dropdown auto arrow id={dropdownId} open={open} onClick={onClick} onToggle={setOpen}>
      {children}
    </Dropdown>
  </DropdownContainer>
}
