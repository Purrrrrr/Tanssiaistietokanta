import { Application, ServiceTypes } from "../../declarations";
import { User } from "../users/users.class";
import { Access, ServiceName } from "./access.schema";

type ServiceParams<Service extends ServiceName> = Parameters<ServiceClass<Service>['find']>[0]
type ServiceEntity<Service extends ServiceName> = Awaited<ReturnType<ServiceClass<Service>['get']>>
type ServiceClass<Service extends ServiceName> = ServiceTypes[Service]

export interface PermissionQuery {
  app: Application
  user?: User
  service: ServiceName
  action: string
  entityId?: string
}

export interface ListPermissionQuery {
  app: Application
  user?: User
  service: ServiceName
}

export interface AccessControlStrategy<Service extends ServiceName> {
  getListQuery: (query: ListPermissionQuery) => Promise<ServiceParams<Service>>
  checkPermission(query: PermissionQuery): Promise<Access>;
}

export const AllowAllStrategy: AccessControlStrategy<ServiceName> = {
  async getListQuery() {
    return {}
  },
  async checkPermission({ service, action }) {
    return {
      service, action, allowed: true, validity: 'global', appliesTo: 'everyone'
    }
  }
}

export const DenyAllStrategy: AccessControlStrategy<ServiceName> = {
  async getListQuery() {
    return {}
  },
  async checkPermission({ service, action }) {
    return {
      service, action, allowed: false, validity: 'global', appliesTo: 'everyone'
    }
  }
}

export const AllowLoggedInStrategy: AccessControlStrategy<ServiceName> = {
  async getListQuery() {
    return {} //Deny is implemented by checkPermission
  },
  async checkPermission({ service, action, user }) {
    return {
      service, action, allowed: user !== undefined, validity: 'global', appliesTo: 'user'
    }
  }
}

export const AllowEveryone = 'everyone'
export const AllowLoggedIn = 'logged-in';
export const allowUser = (userId: string) => `user:${userId}`;

export function entityFieldBasedListingStrategy<Service extends ServiceName>(field: keyof ServiceEntity<Service>): AccessControlStrategy<Service> {
  return {
    async getListQuery({ user }) {
      return {
        [field]: {
          $in: user
            ? [allowUser(user._id), AllowLoggedIn, AllowEveryone]
            : [AllowEveryone],
        },
      }
    },
    async checkPermission({ service, action }) {
      if (action !== 'find' && action !== 'get') {
        throw new Error('entityFieldBasedLlstingStrategy can only be used for find and get actions')
      }
      return {
        service, action, allowed: true, validity: 'global', appliesTo: 'user'
      }
    }
  }
}

type StrategyMap<Service extends ServiceName> =
  Record<string, AccessControlStrategy<Service>>
  & {
    find: AccessControlStrategy<Service>
    default?: AccessControlStrategy<Service>
  }

export function composedStrategy<Service extends ServiceName>(strategies: StrategyMap<Service>): AccessControlStrategy<Service> {
  return {
    async getListQuery(params) {
      return strategies.find.getListQuery(params);
    },
    async checkPermission(params) {
      const strategy = params.action in strategies ? strategies[params.action] : strategies.default ?? DenyAllStrategy;
      return strategy.checkPermission(params);
    }
  }
}
//
// export function checkRight<Service extends ServiceName>(
//   checkerFn: () => Promise<boolean>,
// ): AccessControlStrategy<Service> {
// }
