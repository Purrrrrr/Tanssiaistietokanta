import { lazy } from 'react'

import { RightsQueryProps, useRequirePermissions } from 'libraries/access-control'

const LoginForm = lazy(() => import('components/rights/LoginForm'))

interface RequirePermissionsProps extends NoRightsFallbackProps, RightsQueryProps {
  children: React.ReactNode
}

export function RequirePermissions(props: RequirePermissionsProps) {
  const allowed = useRequirePermissions(props)
  if (allowed) {
    return props.children
  }

  return <NoRightsFallback {...props} />
}

interface NoRightsFallbackProps {
  fallback?: 'loginPage' | React.ReactNode
}

export function NoRightsFallback({ fallback }: NoRightsFallbackProps) {
  switch (fallback) {
    case 'loginPage':
      return <LoginForm />
    default:
      return fallback
  }
}
