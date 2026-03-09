import { Validator } from '@feathersjs/schema'
import { Application } from '../../declarations'
import { AuthTarget, ServiceName } from './access.schema'
import { MaybePromise, ServiceCreateData, ServiceParams, ServicePatchData, ServiceUpdateData, User } from './types'

export type Id = string | number
export type Action = 'list' | 'create' | 'read' | 'modify' | 'delete' | 'manage-access'

export interface AccessStrategy<Service extends ServiceName, EntityAccessData = unknown, ExtraAction extends string = never> {
  initialize?(config: StrategyConfig): Promise<void> | void
  allowAuth?(method: string): ('refreshToken' | 'jwt')[]

  extraActions?: ExtraAction[]
  requestToActions?(request: RequestData<Service>): (Action | ExtraAction)[] | undefined

  authorize(params: AuthParams<EntityAccessData, ExtraAction>): MaybePromise<AuthResponse | undefined>
  authTarget: AuthTarget | ((action: Action) => AuthTarget)
  store?: AccessStrategyDataStore<EntityAccessData>

  getOwnerFromData?(data: ServiceCreateData<Service>): EntityOwner | undefined
  getEntityOwner?(entityId: Id): MaybePromise<EntityOwner> | undefined
}

export type RequestData<Service extends ServiceName> = RequestDataCommon<Service> & (
  | { method: 'find', id?: never, data?: never }
  | { method: 'get', id: Id, data?: never }
  | { method: 'create', id: Id, data: ServiceCreateData<Service> }
  | { method: 'update', id: Id, data: ServiceUpdateData<Service> }
  | { method: 'patch', id: Id, data: ServicePatchData<Service> }
  | { method: 'remove', id: Id, data?: never }
  | { method: 'unknown', methodName: string, id?: Id, data?: unknown }
)
export interface RequestDataCommon<Service extends ServiceName> {
  path: Service
  params: ServiceParams<Service>
}

export interface AuthParams<EntityAccessData, ExtraAction extends string = never> extends EntityOwner {
  user: User | undefined
  action: Action | ExtraAction
  entityData: EntityAccessData | undefined
}

export interface EntityOwner {
  owner?: ServiceName
  owningId?: Id
}

/* The store should store all access related data for an entity. */
export interface AccessStrategyDataStore<AccessData> {
  dataValidator: Validator<AccessData>
  getAccess(entityId: Id): Promise<AccessData> | AccessData
  setAccess(entityId: Id, accessData: AccessData): Promise<void> | void
}

export type AuthResponse = boolean

interface StrategyConfig {
  app: Application
  serviceName: ServiceName
}
