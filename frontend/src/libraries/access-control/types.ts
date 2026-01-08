import { JoinedList } from './typeUtils'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface AccessControlServiceRegistry {
    [s: string]: ServiceRightParams<string[], unknown>
  }
}

// Helper type to define service rights
export interface ServiceRightParams<Rights extends string[] = [string], Entity = never> {
  rights: Rights
  entity?: Entity
}

type ServiceMap = {
  [K in keyof AccessControlServiceRegistry as string extends K ? never : K]: K
}
export type ServiceName = keyof ServiceMap
export type ServiceRights<Service extends ServiceName> = AccessControlServiceRegistry[Service]['rights']
export type ServiceRight<Service extends ServiceName> = ServiceRights<Service>[number]
export type ServiceRightsEntity<Service extends ServiceName> = AccessControlServiceRegistry[Service]['entity']

/* Queries */
export interface ServiceRightQuery<Service extends ServiceName> {
  service: Service
  right: ServiceRight<Service>
  entity?: ServiceRightsEntity<Service>
}
export type RightQuery = { [K in ServiceName]: ServiceRightQuery<K> }[ServiceName]

export type RightQueryString<Service extends ServiceName> = `${Service}:${RightList<Service>}`
type RightList<Service extends ServiceName> = JoinedList<ServiceRights<Service>, ',', 3>
