import { ComponentProps } from 'react'
import classNames from 'classnames'

import type { Color } from './types'

import { RightsQueryProps, withPermissionChecking } from 'libraries/access-control'

export const buttonClass = (
  color: Color,
  { active, disabled, className, minimal, paddingClass }: {
    active?: boolean
    disabled?: boolean
    minimal?: boolean
    className?: string
    paddingClass?: string
  },
) => classNames(
  'interactive-control text-center inline-flex gap-1.5 items-center peer',
  minimal
    ? 'interactive-control-minimal'
    : 'interactive-control-filled rounded-xs shadow-xs hover:shadow-xs active:shadow-md shadow-stone-800/30 border-stone-400/40 border-1',
  ({
    none: minimal ? 'bg-mix-base-stone-800' : 'bg-mix-base-neutral',
    primary: 'bg-mix-base-primary',
    success: 'bg-mix-base-success',
    danger: 'bg-mix-base-danger',
    warning: 'bg-mix-base-warning',
  } satisfies Record<Color, string>)[color],
  paddingClass ?? 'py-[5px] px-2',
  active && 'active',
  disabled && 'disabled',
  className,
)

export interface ButtonProps extends RightsQueryProps, ComponentProps<'button'> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
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
    requireRight: _ignoredRequireRight,
    entity: _ignoredEntity,
    ...rest
  } = props
  return <TooltipContainer tooltip={tooltip}>
    <button type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest}>
      {icon}
      {text}
      {children}
      {rightIcon}
    </button>
  </TooltipContainer>
})

export interface AnchorButtonProps extends RightsQueryProps, ComponentProps<'a'> {
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
    requireRight: _ignoredRequireRight,
    entity: _ignoredEntity,
    ...rest
  } = props
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

function TooltipContainer({ children, tooltip }: TooltipContainerProps) {
  if (!tooltip) {
    return children
  }

  return <div className="inline relative">
    {children}
    <div aria-hidden className="absolute right-1/2 z-40 w-max bg-gray-50 border-gray-500 shadow-md opacity-0 transition-opacity origin-top scale-0 translate-x-1/2 p-[3px] border-1 shadow-black/10 peer-hover:delay-1000 peer-focus-within:delay-1000 peer-hover:opacity-100 top-12/10 peer-focus-within:opacity-100 peer-hover:scale-100 peer-focus-within:scale-100">
      {tooltip}
    </div>
  </div>
}
