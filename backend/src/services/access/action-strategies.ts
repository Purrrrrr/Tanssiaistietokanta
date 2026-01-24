import { User } from "../users/users.class";
import { AccessResult, ServiceName, RequestData } from "./types";

export interface ServiceActionStrategy<Service extends ServiceName, Action extends string, Data = unknown> {
  actions: Record<Action, ActionStrategy<Service, Data>>
  initRequestData?: (ctx: Omit<RequestData<Service>, 'action'>) => Promise<Data> | Data
}

export type ActionStrategy<Service extends ServiceName = ServiceName, Data = unknown> =
  GlobalActionStragegy<Omit<ActionPermissionQuery<Service, Data>, 'entityId'>> |
  EntityActionStragegy<ActionPermissionQuery<Service, Data>>

interface GlobalActionStragegy<Query = unknown> extends ParametrizedActionStragegy<'global', Query> {}
interface EntityActionStragegy<Query = unknown> extends ParametrizedActionStragegy<'entity', Query> {}

interface ParametrizedActionStragegy<Validity extends string, Query = unknown> {
  validity: Validity
  appliesTo: 'everyone' | 'user'
  hasPermission: PermissionFunction<Query>
}

export interface ActionPermissionQuery<Service extends ServiceName, Data = unknown> extends RequestData<Service> {
  data: Data
}

type PermissionFunction<Query> = (query: Query) => Promise<AccessResult> | AccessResult

export const AllowAllStrategy: GlobalActionStragegy = {
  validity: 'global',
  appliesTo: 'everyone',
  hasPermission() {
    return 'GRANT' as const
  }
} as const
export const DenyAllStrategy: GlobalActionStragegy = {
  validity: 'global',
  appliesTo: 'everyone',
  hasPermission() {
    return 'DENY'
  }
}
export const AllowLoggedInStrategy: GlobalActionStragegy<{ user?: User }> = {
  validity: 'global',
  appliesTo: 'user',
  hasPermission({ user }) {
    return user ? 'GRANT' : 'DENY'
  }
}
