import { Application, ServiceTypes } from '../../declarations'
import { User } from '../users/users.class'
import { ServiceName } from './access.schema'

export type { User } from '../users/users.class'
export type AccessResult = 'GRANT' | 'DENY'

export type ServiceQuery<Service extends ServiceName> = Parameters<ServiceClass<Service>['find']>[0]
export type ServiceEntity<Service extends ServiceName> = Awaited<ReturnType<ServiceClass<Service>['get']>>
export type ServiceData<Service extends ServiceName> =
  | Parameters<ServiceClass<Service>['create']>[0]
  | Parameters<ServiceClass<Service>['update' | 'patch']>[1]
export type ServiceClass<Service extends ServiceName> = ServiceTypes[Service]
export { ServiceName }

export interface RequestData<Service extends ServiceName> extends GlobalRequestData<Service> {
  entityId?: string | number
}
export interface GlobalRequestData<Service extends ServiceName> {
  app: Application
  user?: User
  service: ServiceClass<Service>
  serviceName: Service
  action: string
}
export interface EntityRequestData {
  entityId?: string | number
}
