import { LinkComponent } from '@tanstack/react-router'
import React from 'react'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from 'libraries/access-control'
import { type Color, Link } from 'libraries/ui'
import { buttonClass } from 'libraries/ui/Button'

interface NavigateButtonProps extends React.ComponentProps<typeof Link>, PermissionCheckedProps {
  text?: string | React.ReactElement | React.ReactElement[]
  children?: string | React.ReactElement | React.ReactElement[]
  icon?: React.ReactElement
  disabled?: boolean
  minimal?: boolean
  color?: Color
}

const _NavigateButton = withPermissionChecking((props: NavigateButtonProps) => {
  const { text, children, icon, disabled, minimal, color, className, ...rest } = omitPermissionCheckingProps(props)
  const classes = buttonClass(color ?? 'none', { className, disabled, minimal })

  return <Link {...rest} unstyled className={classes} role="button" tabIndex={0} activeProps={{}}>
    {icon}
    {text}
    {children}
  </Link>
})

export const NavigateButton = _NavigateButton as LinkComponent<typeof _NavigateButton>
