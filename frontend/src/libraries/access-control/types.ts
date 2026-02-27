import { JoinedList } from './typeUtils'

/* Service specific rights should be listed as string arrays in the AccessControlServiceRights interface. For example:

declare global {
  interface AccessControlServiceRights{
    'calendar': ['view', 'edit', 'delete']
    'documents': ['read', 'write']
  }
}

This will allow the types to be properly inferred for the useRight and RequirePermissions components.
*/
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface AccessControlServiceRights {
    [s: string]: string[]
  }
}

export interface RightsQuery extends RightQueryContext {
  rights: RightQueryString<ServiceName> | SingleRightQueryString<ServiceName>[]
}

export interface RightQuery<Service extends ServiceName = ServiceName> extends RightQueryParams {
  service: ServiceName
  right: ServiceRight<Service>
}

/* Provide shorthand for specifying a common entity/owner context for queries from different services
 *
 * If context is provided and matches the service, contextId will be used as entityId for that service's rights if entityId is not explicitly provided
 * If context is provided and does not match the service, context will be used as owner and contextId will be used as ownerId for that service's rights if owner/ownerId are not explicitly provided
 *
 * This allows for more concise queries when multiple rights share the same context/owner, while still allowing for explicit overrides when needed
 **/
export interface RightQueryContext extends RightQueryParams {
  context?: ServiceName
  contextId?: ID
}

export interface RightQueryParams {
  entityId?: ID
  owner?: ServiceName
  ownerId?: ID
}

export type ID = string | number
export type ServiceName = keyof ServiceMap
export type ServiceRights<Service extends ServiceName = ServiceName> = AccessControlServiceRights[Service]
export type ServiceRight<Service extends ServiceName = ServiceName> = ServiceRights<Service>[number]

export type SingleRightQueryString<Service extends ServiceName = ServiceName> = `${Service}:${ServiceRight<Service>}`
export type RightQueryString<Service extends ServiceName = ServiceName> = `${Service}:${RightList<Service>}`
type RightList<Service extends ServiceName> = JoinedList<ServiceRights<Service>, ',', 3>

/* Map of services to their rights. This is used to filter out the generic string signature in AccessControlServiceRights */
type ServiceMap = {
  [K in keyof AccessControlServiceRights as string extends K ? never : K]: K
}
