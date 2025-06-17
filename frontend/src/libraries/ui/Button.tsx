import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react'
import classNames from 'classnames'

import type { Color } from './types'

import { IconProp, renderIcon } from './Icon'

export const buttonClass = (
  color: Color,
  { active, disabled, className, minimal }: {
    active?: boolean
    disabled?: boolean
    minimal?: boolean
    className?: string
  }
) => classNames(
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 py-[5px] px-2 text-center inline-flex gap-1.5 items-center',
  minimal ? [
    'hover:bg-opacity-10 active:bg-opacity-20 disabled:saturate-85',
    ({
      none: 'bg-transparent-gray-800 text-stone-700 ',
      primary: 'bg-transparent-blue-600 text-blue-600 saturate-65',
      success: 'bg-transparent-lime-700 text-lime-700',
      danger: ' bg-transparent-orange-700 text-orange-700',
      warning: ' bg-transparent-amber-400 text-amber-400',
    } satisfies Record<Color, string>)[color],
  ] : [
    'rounded-xs shadow-xs hover:shadow-xs active:shadow-md shadow-stone-800/30 border-stone-400/40 border-1  hover:bg-darken-6 active:bg-darken-10 disabled:saturate-75',
    ({
      none: 'bg-stone-100 text-stone-700',
      primary: 'bg-blue-600 text-white saturate-65',
      success: 'bg-lime-700 text-white',
      danger: ' bg-orange-700 text-white',
      warning: ' bg-amber-400',
    } satisfies Record<Color, string>)[color],
  ],
  active && 'active',
  disabled && 'disabled',
  className,
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode
  icon?: IconProp
  rightIcon?: IconProp
  color?: Color
  minimal?: boolean
  active?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props: ButtonProps, ref) {
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
    ...rest
  } = props
  return <button ref={ref} type={type} className={buttonClass(color, {active, className, minimal})} {...rest}>
    {renderIcon(icon)}
    {text}
    {children}
    {renderIcon(rightIcon)}
  </button>
})

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: React.ReactNode
  icon?: IconProp
  rightIcon?: IconProp
  intent?: Color
  minimal?: boolean
  active?: boolean
}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(function Button(props: AnchorButtonProps, ref) {
  const {
    children,
    text,
    intent = 'none',
    active,
    icon,
    rightIcon,
    minimal,
    className,
    ...rest
  } = props
  return <a ref={ref} className={buttonClass(intent, {active, className, minimal})} {...rest}>
    {renderIcon(icon)}
    {text}
    {children}
    {renderIcon(rightIcon)}
  </a>
})
