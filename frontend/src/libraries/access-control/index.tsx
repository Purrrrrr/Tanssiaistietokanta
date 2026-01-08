import { forwardRef } from 'react'

import { RightQuery, RightQueryString, ServiceName, ServiceRightsEntity } from './types'

import { useRightsQueryFn } from './context'
import { parseRightQueryString } from './queryParser'
import { RequirePermissions, type RightsQueryProps } from './RequirePermissions'

export { AccessControlProvider } from './context'
export { RequirePermissions, type RightsQueryProps, useRequirePermissions } from './RequirePermissions'
export type { RightQuery, ServiceName, ServiceRightParams } from './types'

export function useRight<Service extends ServiceName>(query: RightQueryString<Service>, entity?: ServiceRightsEntity<Service>): boolean {
  return useRights(query, entity).every(Boolean)
}

export function useRights<Service extends ServiceName>(query: RightQueryString<Service> | RightQueryString<Service>[], entity?: ServiceRightsEntity<Service>): boolean[] {
  const queryFn = useRightsQueryFn()
  const queries = parseRightQueryString(query, entity) as RightQuery[]
  return queries.map(queryFn)
}

export function withPermissionChecking<Props>(Component: React.ComponentType<Props>): React.ComponentType<Props & RightsQueryProps> {
  return forwardRef(<Service extends ServiceName = ServiceName>(props: Props & RightsQueryProps<Service>, ref) => <RequirePermissions {...props}>
    <Component {...props} ref={ref} />
  </RequirePermissions>) as React.ComponentType<Props & RightsQueryProps>
}
