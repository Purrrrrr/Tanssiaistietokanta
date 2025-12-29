import { ID } from 'backend/types'

import { RightQueryInput, useHasRight } from 'services/users'

interface RequirePermissionsProps extends RequirePermissionsWrapperProps {
  children: React.ReactNode
}

export function RequirePermissions(props: RequirePermissionsProps) {
  const wrapper = useRequirePermissionsWrapper(props)
  return wrapper(props.children)
}

interface RequirePermissionsWrapperProps extends NoRightsFallbackProps {
  right: RightQueryInput
  entityId?: ID
}

export function useRequirePermissionsWrapper({ right, entityId, ...props }: RequirePermissionsWrapperProps) {
  if (useHasRight(right, entityId)) {
    return (children: React.ReactNode) => <>{children}</>
  }

  return () => <NoRightsFallback {...props} />
}

interface NoRightsFallbackProps {
  fallback?: 'loginPage' | 'message' | 'hide'
  fallbackContents?: React.ReactNode
}

export function NoRightsFallback(props: NoRightsFallbackProps) {
  // TODO: implement 'loginPage' and 'message' fallbacks
  return props.fallbackContents ?? null
}
