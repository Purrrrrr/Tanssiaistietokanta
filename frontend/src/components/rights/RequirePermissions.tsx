import { lazy } from 'react'

import { RightQueryInput, RightsEntity, useHasRight } from 'services/users'

const LoginForm = lazy(() => import('components/rights/LoginForm'))

interface RequirePermissionsProps extends RequirePermissionsWrapperProps {
  children: React.ReactNode
}

export function RequirePermissions(props: RequirePermissionsProps) {
  const wrapper = useRequirePermissionsWrapper(props)
  return wrapper(props.children)
}

interface RequirePermissionsWrapperProps extends NoRightsFallbackProps {
  right: RightQueryInput
  entity?: RightsEntity
}

export function useRequirePermissionsWrapper({ right, entity, ...props }: RequirePermissionsWrapperProps) {
  if (useHasRight(right, entity)) {
    return (children: React.ReactNode) => <>{children}</>
  }

  return () => <NoRightsFallback {...props} />
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
