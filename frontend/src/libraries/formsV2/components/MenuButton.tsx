import { MouseEvent, ReactNode, useRef } from 'react'
import { Button, ButtonProps } from '@blueprintjs/core'
import { UseComboboxGetToggleButtonPropsReturnValue, useSelect } from 'downshift'

import { getFocusableElements } from 'libraries/dialog'
import { Dropdown, DropdownContainer } from 'libraries/overlays'

import { preventDownshiftDefaultWhen } from './inputs/selectors/utils'

interface MenuButtonProps {
  children: ReactNode
  containerClassname?: string
  text?: string
  buttonRenderer?: (props: Omit<UseComboboxGetToggleButtonPropsReturnValue, 'tabIndex'>) => ReactNode
  buttonProps?: ButtonProps
}

export default function MenuButton({ children, buttonRenderer, text, buttonProps, containerClassname }: MenuButtonProps) {
  'use no memo'
  const {
    isOpen,
    closeMenu,
    getToggleButtonProps,
    getMenuProps,
  } = useSelect({
    items: [null],
    selectedItem: null,
    onIsOpenChange: async (a) => {
      if (a.isOpen && containerRef.current) {
        // TODO: fix the hack
        getFocusableElements(containerRef.current)[1]?.focus()
      }
    },
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const downshiftButtonProps = getToggleButtonProps({
    onClick: preventDownshiftDefaultWhen(e => e.detail === 0),
  })
  const onClick = (e: MouseEvent) => {
    // Refine this to actually work
    if ((e.target as HTMLElement).tagName === 'BUTTON') {
      closeMenu()
    }
  }
  const onBlur = () => {
    setTimeout(() => {
      if (!(containerRef?.current as HTMLElement)?.contains(document.activeElement)) {
        closeMenu()
      }
    }, 50)
  }

  return <DropdownContainer className={containerClassname} ref={containerRef}>
    {buttonRenderer
      ? buttonRenderer(downshiftButtonProps)
      : <Button
        {...downshiftButtonProps}
        onBlur={() => {}}
        active={downshiftButtonProps['aria-expanded']}
        rightIcon="double-caret-vertical"
        text={text}
        {...buttonProps}
      />
    }
    <Dropdown open={isOpen} arrow onClick={onClick} onBlur={onBlur}>
      <div {...getMenuProps()} onKeyUp={e => e.key === 'Escape' ? closeMenu() : null}>
        {isOpen && children}
      </div>
    </Dropdown>
  </DropdownContainer>
}
