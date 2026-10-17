import { ComponentProps, useState } from 'react'

import type { Color } from './types'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from '@/libraries/access-control'

import { buttonClass } from './buttonClass'
import { Icon, type IconContent } from './Icon'
import { ControlledPopover } from './overlays/unstyled/Popover'

export interface ButtonProps extends PermissionCheckedProps, Omit<ComponentProps<'button'>, 'children'> {
  text: React.ReactNode
  icon?: IconContent | null | false
  iconOnly?: boolean // Is this a icon button without text? If so, we need to add a sr-only span for accessibility.
  rightIcon?: IconContent | null | false
  color?: Color
  minimal?: boolean
  active?: boolean
  paddingClass?: string
  tooltip?: React.ReactNode
}

export const Button = withPermissionChecking(function Button(props: ButtonProps) {
  const {
    type = 'button',
    text,
    iconOnly,
    color = 'none',
    active,
    icon,
    rightIcon,
    minimal,
    className,
    paddingClass,
    tooltip,
    ...rest
  } = omitPermissionCheckingProps(props)

  return withTooltip(tooltip ?? (iconOnly ? text : undefined),
    <button type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest}>
      {icon && <Icon icon={icon} />}
      {iconOnly
        ? <span className="outside-overflow-menu:sr-only">{text}</span>
        : text
      }
      {rightIcon && <Icon icon={rightIcon} />}
    </button>,
  )
})

export interface AnchorButtonProps extends PermissionCheckedProps, Omit<ComponentProps<'a'>, 'children'> {
  text: React.ReactNode
  iconOnly?: boolean // Same logic as in Button
  icon?: IconContent | null | false
  rightIcon?: IconContent | null | false
  color?: Color
  minimal?: boolean
  active?: boolean
  tooltip?: React.ReactNode
}

export const AnchorButton = withPermissionChecking(function Button(props: AnchorButtonProps) {
  const {
    text,
    iconOnly,
    color = 'none',
    active,
    icon,
    rightIcon,
    minimal,
    className,
    tooltip,
    ...rest
  } = omitPermissionCheckingProps(props)
  return withTooltip(tooltip,
    <a className={buttonClass(color, { active, className, minimal })} {...rest}>
      {icon && <Icon icon={icon} />}
      {iconOnly
        ? <span className="outside-overflow-menu:sr-only">{text}</span>
        : text
      }
      {rightIcon && <Icon icon={rightIcon} />}
    </a>,
  )
})

function withTooltip(tooltip: React.ReactNode, children: React.ReactNode) {
  if (!tooltip) {
    return children
  }

  return <TooltipContainer tooltip={tooltip}>
    {children}
  </TooltipContainer>
}

interface TooltipContainerProps {
  children: React.ReactNode
  tooltip: React.ReactNode
}

export function TooltipContainer({ children, tooltip }: TooltipContainerProps) {
  const [open, setOpen] = useState(false)

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return <div
    className="tooltip-container inline"
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
    onFocus={() => setOpen(true)}
    onBlur={() => setOpen(false)}
    onKeyDown={e => e.key === 'Escape' && setOpen(false)}
  >
    {/* eslint-enable jsx-a11y/no-static-element-interactions */}
    {children}
    <ControlledPopover
      type="manual"
      open={open}
      onToggle={setOpen}
      aria-hidden
      openClassname="tooltip-open"
      className="tooltip w-max bg-gray-50 border-gray-500 shadow-md p-0.75 border shadow-black/10"
    >
      {tooltip}
    </ControlledPopover>
  </div>
}
