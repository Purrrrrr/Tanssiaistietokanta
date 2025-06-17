import React from 'react'

import {useIsAdmin} from 'services/users'

import { type Color, Icon, Link } from 'libraries/ui'
import { buttonClass } from 'libraries/ui/Button'

interface NavigateButtonProps extends Omit<React.ComponentProps<typeof Link>, 'to'> {
  text?: string | React.ReactElement | React.ReactElement[],
  children?: string | React.ReactElement | React.ReactElement[],
  icon?: React.ComponentProps<typeof Icon>['icon']
  adminOnly?: boolean,
  disabled?: boolean,
  href: string,
  intent?: Color,
  className?: string,
}

export function NavigateButton({text, children, icon, adminOnly, disabled, href, intent, className, ...props} : NavigateButtonProps) {
  const isAdmin = useIsAdmin()
  if (adminOnly && !isAdmin) return null

  const classes = buttonClass(intent ?? 'none', { className, disabled })

  const onClick = props.onClick ??
    (props.target ==='_blank' ? openLinkWithTarget : undefined)

  return <Link {...props} unstyled className={classes} role="button"
    tabIndex={0} to={href} onClick={onClick}>
    {icon && <Icon icon={icon} />}
    {text}
    {children}
  </Link>
}

function openLinkWithTarget(e) {
  e.preventDefault()
  window.open(e.target.href)
}
