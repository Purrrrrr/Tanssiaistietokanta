import React from 'react'
import {Link} from 'react-router-dom'
import {Classes, Intent} from '@blueprintjs/core'
import {useIsAdmin} from 'services/users'
import classNames from 'classnames'

interface NavigateButtonProps extends Omit<React.ComponentProps<typeof Link>, 'to'> {
  text: string,
  adminOnly?: boolean,
  disabled?: boolean,
  href: string,
  intent?: Intent,
  className?: string,
}

export function NavigateButton({text, adminOnly, disabled, href, intent, className, ...props} : NavigateButtonProps) {
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
    {text}
  </Link>
}

function openLinkWithTarget(e) {
  e.preventDefault()
  window.open(e.target.href)
}
