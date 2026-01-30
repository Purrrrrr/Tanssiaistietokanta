import { Validator } from "@feathersjs/schema";
import { Application } from "../../declarations";
import { ServiceName } from "./access.schema";
import { User } from "./types";

export interface Entity {
  _id: Id
}
export type Id = string | number
export type Action = 'read' | 'create' | 'update' | 'remove' | 'manage-access';
// type Methods = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove';

export interface AccessStrategy<AccessData = void> {
  initialize?(config: StrategyConfig): Promise<void> | void

  // actions: Action[]
  authorize(action: Action, user?: User, entityId?: string | number, data?: AccessData): Promise<AuthResponse> | AuthResponse
  store?: AccessStrategyDataStore<AccessData>

  // authorizeRequest?(method: Methods, requestData: RequestData<ServiceName, Action, AccessData>): Promise<boolean> | boolean
}

export interface AccessStrategyDataStore<AccessData> {
  dataValidator: Validator<AccessData>
  getAccess(entityId: Id): Promise<AccessData> | AccessData
  setAccess(entityId: Id, accessData: AccessData): Promise<void> | void
}

interface AuthResponse {
  validity: 'global' | 'entity'
  appliesTo: 'everyone' | 'user'
  hasPermission: boolean
}

interface StrategyConfig {
  app:Application 
  serviceName: ServiceName
}
