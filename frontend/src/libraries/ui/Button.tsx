import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react'
import classNames from 'classnames'

import type { Color } from './types'

import { RightsQueryProps, withPermissionChecking } from 'libraries/access-control'

import { ColorClass } from './classes'

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
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-center inline-flex gap-1.5 items-center peer',
  minimal ? [
    'hover:bg-opacity-10 active:bg-opacity-20 focus:bg-opacity-5 disabled:saturate-85',
    ({
      none: 'bg-var-gray-800 text-stone-700 ',
      primary: 'bg-var-sky-600 text-sky-600 saturate-65',
      success: 'bg-var-lime-700 text-lime-700',
      danger: ' bg-var-orange-700 text-orange-700',
      warning: ' bg-var-amber-400 text-amber-400',
    } satisfies Record<Color, string>)[color],
  ] : [
    'rounded-xs shadow-xs hover:shadow-xs active:shadow-md shadow-stone-800/30 border-stone-400/40 border-1  hover:bg-darken-6 active:bg-darken-10 disabled:saturate-75',
    ColorClass.boxColors[color],
  ],
  paddingClass ?? 'py-[5px] px-2',
  active && 'active',
  disabled && 'disabled',
  className,
)

export interface ButtonProps extends ButtonOwnProps, RightsQueryProps {}

interface ButtonOwnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
  color?: Color
  minimal?: boolean
  active?: boolean
  paddingClass?: string
  tooltip?: React.ReactNode
}

export const Button = withPermissionChecking(forwardRef<HTMLButtonElement, ButtonOwnProps>(function Button(props: ButtonOwnProps, ref) {
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
  } = props
  return <TooltipContainer tooltip={tooltip}>
    <button ref={ref} type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest}>
      {icon}
      {text}
      {children}
      {rightIcon}
    </button>
  </TooltipContainer>
}))

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
  color?: Color
  minimal?: boolean
  active?: boolean
  tooltip?: React.ReactNode
}

export const AnchorButton = withPermissionChecking(forwardRef<HTMLAnchorElement, AnchorButtonProps>(function Button(props: AnchorButtonProps, ref) {
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
  } = props
  return <TooltipContainer tooltip={tooltip}>
    <a ref={ref} className={buttonClass(color, { active, className, minimal })} {...rest}>
      {icon}
      {text}
      {children}
      {rightIcon}
    </a>
  </TooltipContainer>
}))

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
