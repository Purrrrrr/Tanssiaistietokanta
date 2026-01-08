import { RightQuery, RightQueryString, ServiceName, ServiceRightQuery, ServiceRightsEntity } from './types'

import { useRightsQueryFn } from './context'
import { parseRightQueryString } from './queryParser'

type RequirePermissionsProps<Service extends ServiceName> = RightsQueryProps<Service> & {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePermissions<Service extends ServiceName>(props: RequirePermissionsProps<Service>) {
  if (!useRequirePermissions(props)) {
    return props.fallback ?? null
  }

  return props.children
}

export function useRequirePermissions<Service extends ServiceName>(props: RightsQueryProps<Service>): boolean {
  const queries = parseRightQueryProps(props)
  const queryFn = useRightsQueryFn()
  return queries.map(queryFn).every(Boolean)
}

export interface RightsQueryProps<Service extends ServiceName = ServiceName> {
  requireRight?: RightQueryString<Service> | ServiceRightQuery<Service> | ServiceRightQuery<Service>[]
  entity?: ServiceRightsEntity<Service>
}

export function parseRightQueryProps<Service extends ServiceName>(props: RightsQueryProps<Service>): RightQuery[] {
  if (props.requireRight === undefined) {
    return []
  }
  if (Array.isArray(props.requireRight)) {
    if (props.entity) throw new Error('Cannot specify entity when requireRight is an array of RightQuery objects')
    return props.requireRight as RightQuery[]
  }
  if (typeof props.requireRight === 'object') {
    if (props.entity) throw new Error('Cannot specify entity when requireRight is a RightQuery object')
    return [props.requireRight as RightQuery]
  }
  return parseRightQueryString(props.requireRight, props.entity) as RightQuery[]
}
