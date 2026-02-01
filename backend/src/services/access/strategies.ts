import { Validator } from "@feathersjs/schema";
import { Application } from "../../declarations";
import { ServiceName } from "./access.schema";
import { User } from "./types";

export interface Entity {
  _id: Id
}
export type Id = string | number
export type GlobalAction = 'create'
export type Action = 'read' | 'update' | 'remove' | 'manage-access'

export interface AugmentedAccessStrategy<EntityAccessData = unknown, GlobalAccessData = unknown> extends AccessStrategy<EntityAccessData, GlobalAccessData> {
  authorizeEntity(
    params: Omit<EntityAuthParams<EntityAccessData>, 'type'>,
  ): MaybePromise<AuthResponse>
  authorizeGlobal(
    params: Omit<GlobalAuthParams, 'type' | 'entityData'>,
  ): MaybePromise<AuthResponse | undefined>
}

export function augmentStrategy<EntityAccessData, GlobalAccessData>(
  strategy: AccessStrategy<EntityAccessData, GlobalAccessData>
): AugmentedAccessStrategy<EntityAccessData, GlobalAccessData> {
  const augmented: AugmentedAccessStrategy<EntityAccessData, GlobalAccessData> = {
    ...strategy,
    authorizeEntity: async (params) => {
      const result = await strategy.authorize({ type: 'entity', ...params })
      if (result === undefined) {
        return false
      }
      return result
    },
    authorizeGlobal: async (params) => {
      return strategy.authorize({ type: 'global', entityData: undefined, ...params })
    }
  }
  return augmented
}

export interface AccessStrategy<EntityAccessData = unknown, GlobalAccessData = unknown> {
  initialize?(config: StrategyConfig): Promise<void> | void

  authorize(
    params: AuthParams<EntityAccessData>,
  ): MaybePromise<AuthResponse | undefined>
  globalStore?: GlobalAccessStrategyDataStore<GlobalAccessData>
  store?: AccessStrategyDataStore<EntityAccessData>

  // authorizeRequest?(method: Methods, requestData: RequestData<ServiceName, Action, AccessData>): Promise<boolean> | boolean
}

type MaybePromise<T> = Promise<T> | T

export type AuthParams<EntityAccessData> = GlobalAuthParams | EntityAuthParams<EntityAccessData>

interface GlobalAuthParams {
  type: 'global'
  user: User | undefined,
  action: GlobalAction | Action
  entityData: undefined
}
interface EntityAuthParams<EntityAccessData> {
  type: 'entity'
  user: User | undefined,
  action: Action
  entityData: EntityAccessData
}

export interface GlobalAccessStrategyDataStore<AccessData> {
  dataValidator: Validator<AccessData>
  setAccess?(accessData: AccessData): Promise<void> | void
}

/* The store should store all access related data for an entity. */
export interface AccessStrategyDataStore<AccessData> {
  dataValidator: Validator<AccessData>
  getAccess(entityId: Id): Promise<AccessData> | AccessData
  setAccess(entityId: Id, accessData: AccessData): Promise<void> | void
}

export type AuthResponse = boolean

interface StrategyConfig {
  app:Application 
  serviceName: ServiceName
}
