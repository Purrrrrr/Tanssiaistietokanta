import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react'
import classNames from 'classnames'

import type { Color } from './types'

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
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-center inline-flex gap-1.5 items-center',
  minimal ? [
    'hover:bg-opacity-10 active:bg-opacity-20 disabled:saturate-85',
    ({
      none: 'bg-var-gray-800 text-stone-700 ',
      primary: 'bg-var-blue-600 text-blue-600 saturate-65',
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
  color?: Color
  minimal?: boolean
  active?: boolean
  paddingClass?: string
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
    paddingClass,
    ...rest
  } = props
  return <button ref={ref} type={type} className={buttonClass(color, { active, className, minimal, paddingClass })} {...rest}>
    {icon}
    {text}
    {children}
    {rightIcon}
  </button>
})

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: React.ReactNode
  icon?: React.ReactElement
  rightIcon?: React.ReactElement
  color?: Color
  minimal?: boolean
  active?: boolean
}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(function Button(props: AnchorButtonProps, ref) {
  const {
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
  return <a ref={ref} className={buttonClass(color, { active, className, minimal })} {...rest}>
    {icon}
    {text}
    {children}
    {rightIcon}
  </a>
})
