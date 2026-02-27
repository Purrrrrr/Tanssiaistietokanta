import React from 'react'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from 'libraries/access-control'
import { type Color, Link } from 'libraries/ui'
import { buttonClass } from 'libraries/ui/Button'

interface NavigateButtonProps extends Omit<React.ComponentProps<typeof Link>, 'to'>, PermissionCheckedProps {
  text?: string | React.ReactElement | React.ReactElement[]
  children?: string | React.ReactElement | React.ReactElement[]
  icon?: React.ReactElement
  disabled?: boolean
  minimal?: boolean
  href: string
  color?: Color
  className?: string
}

export const NavigateButton = withPermissionChecking((props: NavigateButtonProps) => {
  const { text, children, icon, disabled, minimal, href, color, className, ...rest } = omitPermissionCheckingProps(props)
  const classes = buttonClass(color ?? 'none', { className, disabled, minimal })

  const onClick = props.onClick ??
    (props.target === '_blank' ? openLinkWithTarget : undefined)

  return <Link {...rest} unstyled className={classes} role="button"
    tabIndex={0} to={href} onClick={onClick}>
    {icon}
    {text}
    {children}
  </Link>
})

function openLinkWithTarget(e) {
  e.preventDefault()
  window.open(e.target.href)
}
