import React from 'react'
import {Link} from 'react-router-dom'
import {Classes, Intent} from '@blueprintjs/core'
import classNames from 'classnames'

import {useIsAdmin} from 'services/users'

import { Icon } from 'libraries/ui'

interface NavigateButtonProps extends Omit<React.ComponentProps<typeof Link>, 'to'> {
  text?: string | React.ReactElement | React.ReactElement[],
  children?: string | React.ReactElement | React.ReactElement[],
  icon?: React.ComponentProps<typeof Icon>['icon']
  adminOnly?: boolean,
  disabled?: boolean,
  href: string,
  intent?: Intent,
  className?: string,
}

export function NavigateButton({text, children, icon, adminOnly, disabled, href, intent, className, ...props} : NavigateButtonProps) {
  const isAdmin = useIsAdmin()
  if (adminOnly && !isAdmin) return null

  const classes = classNames(
    Classes.BUTTON,
    {[Classes.DISABLED]: disabled},
    Classes.intentClass(intent),
    className
  )
  const onClick = props.onClick ??
    (props.target ==='_blank' ? openLinkWithTarget : undefined)

  return <Link {...props} className={classes} role="button"
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
