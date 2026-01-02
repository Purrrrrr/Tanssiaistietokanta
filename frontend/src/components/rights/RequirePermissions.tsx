import { RightQueryInput, RightsEntity, useHasRight } from 'services/users'

import { LoginForm } from './LoginForm'

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
  fallback?: 'loginPage' | 'message' | 'hide'
  fallbackContents?: React.ReactNode
}

export function NoRightsFallback({ fallback, fallbackContents }: NoRightsFallbackProps) {
  switch (fallback) {
    case 'hide':
      return fallbackContents ?? null
    case 'loginPage':
      return <LoginForm />
    case 'message':
      // TODO: implement 'message' fallback style
      return fallbackContents ?? null
  }
}
