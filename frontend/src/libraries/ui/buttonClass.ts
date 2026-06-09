import classNames from 'classnames'

import type { Color } from './types'

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
