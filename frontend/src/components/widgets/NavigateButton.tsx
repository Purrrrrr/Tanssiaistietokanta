import React from 'react'

import { RightQueryInput, RightsEntity, useHasRight } from 'services/users'

import { type Color, Link } from 'libraries/ui'
import { buttonClass } from 'libraries/ui/Button'

interface NavigateButtonProps extends Omit<React.ComponentProps<typeof Link>, 'to'> {
  text?: string | React.ReactElement | React.ReactElement[]
  children?: string | React.ReactElement | React.ReactElement[]
  icon?: React.ReactElement
  requireRight?: RightQueryInput
  entity?: RightsEntity
  disabled?: boolean
  minimal?: boolean
  href: string
  color?: Color
  className?: string
}

export function NavigateButton({ text, children, icon, disabled, minimal, href, color, className, requireRight, entity, ...props }: NavigateButtonProps) {
  const hasRight = useHasRight(requireRight, entity)
  if (!hasRight) return null

  const classes = buttonClass(color ?? 'none', { className, disabled, minimal })

  const onClick = props.onClick ??
    (props.target === '_blank' ? openLinkWithTarget : undefined)

  return <Link {...props} unstyled className={classes} role="button"
    tabIndex={0} to={href} onClick={onClick}>
    {icon}
    {text}
    {children}
  </Link>
}

function openLinkWithTarget(e) {
  e.preventDefault()
  window.open(e.target.href)
}
