import { ComponentProps, forwardRef } from 'react'
import classNames from 'classnames'

import type { Color } from './types'

import { IconProp, renderIcon } from './Icon'

export const buttonClass = (
  color: Color,
  { active, disabled, className, minimal, anchor }: {
    active?: boolean
    disabled?: boolean
    minimal?: boolean
    anchor?: boolean
    className?: string
  }
) => classNames(
  //TODO: remove text-inherit and no-underline when blueprintjs is eradicated
  minimal && anchor && 'hover:no-underline!',
  minimal
    ? 'bg-white text-stone-700'
    : ({
      none: 'bg-stone-200 text-stone-700',
      primary: 'bg-sky-700 text-white',
      success: 'bg-lime-700 text-white',
      danger: ' bg-orange-700 text-white',
      warning: ' bg-amber-400',
    } satisfies Record<Color, string>)[color],
  'py-[5px] px-2 text-center inline-flex gap-1.5 items-center',
  !minimal && 'rounded-xs shadow-xs hover:shadow-sm active:shadow-md shadow-stone-800/50 border-stone-400/40 border-1',
  'cursor-pointer transition-colors hover:bg-darken-4 active:bg-darken-10',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-75',
  active && 'active',
  disabled && 'disabled',
  className,
)

export interface ButtonProps extends ComponentProps<'button'> {
  text?: React.ReactNode
  icon?: IconProp
  rightIcon?: IconProp
  intent?: Color
  minimal?: boolean
  active?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props: ButtonProps, ref) {
  const {
    type = 'button',
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
  return <button ref={ref} type={type} className={buttonClass(intent, {active, className, minimal, anchor: false})} {...rest}>
    {renderIcon(icon)}
    {text}
    {children}
    {renderIcon(rightIcon)}
  </button>
})

export interface AnchorButtonProps extends ComponentProps<'a'> {
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
  return <a ref={ref} className={buttonClass(intent, {active, className, minimal, anchor: true})} {...rest}>
    {renderIcon(icon)}
    {text}
    {children}
    {renderIcon(rightIcon)}
  </a>
})
