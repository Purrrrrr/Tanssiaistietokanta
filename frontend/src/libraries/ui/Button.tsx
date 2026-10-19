import { ComponentProps, useId, useState } from 'react'

import type { Color } from './types'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from '@/libraries/access-control'

import { buttonClass } from './buttonClass'
import { AnchorProps } from './hooks/useTooltip'
import { Icon, type IconContent } from './Icon'
import { ControlledPopover } from './overlays/unstyled/Popover'
import { TooltipContainer } from './TooltipContainer'

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
    tooltipProps => <button type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest} {...tooltipProps}>
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
    tooltipProps => <a className={buttonClass(color, { active, className, minimal })} {...rest} {...tooltipProps}>
      {icon && <Icon icon={icon} />}
      {iconOnly
        ? <span className="outside-overflow-menu:sr-only">{text}</span>
        : text
      }
      {rightIcon && <Icon icon={rightIcon} />}
    </a>,
  )
})

function withTooltip(tooltip: React.ReactNode, children: (props: AnchorProps | null) => React.ReactNode) {
  if (!tooltip) {
    return children(null)
  }

  return <TooltipContainer tooltip={tooltip}>
    {props => children(props)}
  </TooltipContainer>
}
