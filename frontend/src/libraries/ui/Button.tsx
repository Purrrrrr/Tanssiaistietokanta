import { ComponentProps } from 'react'

import type { Color } from './types'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from 'libraries/access-control'

import { buttonClass } from './buttonClass'

export interface ButtonProps extends PermissionCheckedProps, ComponentProps<'button'> {
  text?: React.ReactNode
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  color?: Color
  minimal?: boolean
  active?: boolean
  paddingClass?: string
  tooltip?: React.ReactNode
}

export const Button = withPermissionChecking(function Button(props: ButtonProps) {
  const {
    type = 'button',
    children,
    text,
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
  return <TooltipContainer tooltip={tooltip}>
    <button type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest}>
      {icon}
      {text}
      {children}
      {rightIcon}
    </button>
  </TooltipContainer>
})

export interface AnchorButtonProps extends PermissionCheckedProps, ComponentProps<'a'> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
  color?: Color
  minimal?: boolean
  active?: boolean
  tooltip?: React.ReactNode
}

export const AnchorButton = withPermissionChecking(function Button(props: AnchorButtonProps) {
  const {
    children,
    text,
    color = 'none',
    active,
    icon,
    rightIcon,
    minimal,
    className,
    tooltip,
    ...rest
  } = omitPermissionCheckingProps(props)
  return <TooltipContainer tooltip={tooltip}>
    <a className={buttonClass(color, { active, className, minimal })} {...rest}>
      {icon}
      {text}
      {children}
      {rightIcon}
    </a>
  </TooltipContainer>
})

interface TooltipContainerProps {
  children: React.ReactNode
  tooltip?: React.ReactNode
}

export function TooltipContainer({ children, tooltip }: TooltipContainerProps) {
  if (!tooltip) {
    return children
  }

  return <div className="tooltip-container inline">
    {children}
    <div aria-hidden className="tooltip w-max bg-gray-50 border-gray-500 shadow-md p-[3px] border shadow-black/10">
      {tooltip}
    </div>
  </div>
}
