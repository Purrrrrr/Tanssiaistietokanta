import { ServiceTypes } from '../../declarations'
import { ServiceName } from './access.schema'

export type { User } from '../users/users.class'
export type AccessResult = 'GRANT' | 'DENY'

export type ServiceParams<Service extends ServiceName> = Parameters<ServiceClass<Service>['find']>[0]
export type ServiceEntity<Service extends ServiceName> = Awaited<ReturnType<ServiceClass<Service>['get']>>
export type ServiceCreateData<Service extends ServiceName> = Parameters<ServiceClass<Service>['create']>[0]
export type ServiceUpdateData<Service extends ServiceName> = Parameters<ServiceClass<Service>['update']>[1]
export type ServicePatchData<Service extends ServiceName> = | Parameters<ServiceClass<Service>['patch']>[1]
export type ServiceClass<Service extends ServiceName> = ServiceTypes[Service]
export { ServiceName }

export type MaybePromise<T> = Promise<T> | T
