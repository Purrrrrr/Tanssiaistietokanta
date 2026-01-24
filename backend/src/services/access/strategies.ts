import { HookContext } from "../../declarations";
import { AccessResult, GlobalRequestData, RequestData, ServiceEntity, ServiceName, ServiceQuery } from "./types";

export * from './action-strategies'

export interface ServiceAccessStrategy<Service extends ServiceName, Action extends string> {
  getFindQuery?: GetFindQuery<Service>
  authenticate: Record<string, (query: PermissionQuery<Service, Action>) => Promise<AccessResult | boolean> | AccessResult | boolean>
}

type GetFindQuery<Service extends ServiceName> = (query: ListPermissionQuery<Service>) => Promise<ServiceQuery<Service>>

export interface ListPermissionQuery<Service extends ServiceName = ServiceName> extends GlobalRequestData<Service>, AuthenticationContext {

}
export interface PermissionQuery<Service extends ServiceName = ServiceName, Action extends string = string> extends RequestData<Service>, AuthenticationContext<Action> {

}

interface AuthenticationContext<Action extends string = string> {
  ctx: HookContext
  canDo(action: Action): Promise<boolean>
}


export const AllowEveryone = 'everyone'
export const AllowLoggedIn = 'logged-in';
export const allowUser = (userId: string) => `user:${userId}`;

export function entityFieldBasedListingQuery<Service extends ServiceName>(field: keyof ServiceEntity<Service>): GetFindQuery<Service> {
  return async ({ user }) => {
    return {
      [field]: {
        $in: user
          ? [allowUser(user._id), AllowLoggedIn, AllowEveryone]
          : [AllowEveryone],
      },
    }
  }
}
