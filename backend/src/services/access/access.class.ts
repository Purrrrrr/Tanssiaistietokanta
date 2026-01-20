// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Access, AccessQuery, ServiceName } from './access.schema'
import { AccessControlStrategy, AllowAllStrategy, ListPermissionQuery, PermissionQuery } from './strategies'
import { User } from '../users/users.class'

export type { Access, AccessQuery }

export interface AccessServiceOptions {
  app: Application
}

export interface AccessParams extends Params<AccessQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class AccessService<ServiceParams extends AccessParams = AccessParams>
  implements ServiceInterface<Access, never, ServiceParams, never>
{
  private strategies: Map<string, AccessControlStrategy<ServiceName>> = new Map()
  private defaultStrategy: AccessControlStrategy<ServiceName> = AllowAllStrategy

  constructor(public options: AccessServiceOptions) {}

  setStrategy(service: ServiceName, strategy: AccessControlStrategy<ServiceName>) {
    if (this.strategies.has(service)) {
      throw new Error(`Strategy for service ${service} is already set`)
    }
    this.strategies.set(service, strategy)
  }

  hasStrategy(service: string): boolean {
    return this.strategies.has(service)
  }

  async find(params?: ServiceParams): Promise<Access> {
    const { entityId, service, action } = params?.query || {}
    const user = params?.user
    return this.hasPermission({ user, service: service!, action: action!, entityId })
  }

  async hasPermission(params: Omit<PermissionQuery, 'app'>): Promise<Access> {
    const strategy = this.getStrategy(params.service)
    return strategy.checkPermission({ ...params, app: this.options.app })
  }

  async getListQuery(params: Omit<ListPermissionQuery, 'app'>): Promise<ServiceParams['query']> {
    const strategy = this.getStrategy(params.service)
    return strategy.getListQuery({ ...params, app: this.options.app }) as any
  }

  getStrategy(service?: string): AccessControlStrategy<ServiceName> {
    if (!service) {
      throw new Error('Service must be specified in the query')
    }
    return this.strategies.get(service) ?? this.defaultStrategy
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
