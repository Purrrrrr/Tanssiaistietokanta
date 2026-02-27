import { RightQueryContext, RightsQuery } from './types'

import { useRights } from './hooks'

export interface RequirePermissionsProps extends RightsQueryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface RightsQueryProps extends RightQueryContext {
  requireRight: RightsQuery['rights']
}

export function RequirePermissions(props: RequirePermissionsProps) {
  if (!useRequirePermissions(props)) {
    return props.fallback ?? null
  }

  return props.children
}

export function useRequirePermissions({ requireRight, ...ctx }: RightsQueryProps): boolean {
  return useRights(requireRight, ctx).every(Boolean)
}
