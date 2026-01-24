// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Access, AccessQuery, ServiceName } from './access.schema'
import { ServiceAccessStrategy } from './strategies'
import { ActionPermissionQuery, ServiceActionStrategy } from './action-strategies'

export type { Access, AccessQuery }

export interface AccessServiceOptions {
  app: Application
}

export interface AccessParams extends Params<AccessQuery> {}

export interface ServiceStrategy<Service extends ServiceName, Action extends string, Data>
  extends ServiceAccessStrategy<Service, Action>, ServiceActionStrategy<Service, Action, Data> {
  service: Service
}

export class AccessService<ServiceParams extends AccessParams = AccessParams>
  implements ServiceInterface<Access, never, ServiceParams, never>
{
  private strategies: Map<string, ServiceStrategy<ServiceName, string, unknown>> = new Map()

  constructor(public options: AccessServiceOptions) {}

  addAccessStrategy<Service extends ServiceName, Action extends string, Data>(
    strategy: ServiceStrategy<Service, Action, Data>
  ) {
    if (this.strategies.has(strategy.service)) {
      throw new Error(`Access actions for service ${strategy.service} are already set`)
    }
    this.strategies.set(strategy.service, strategy as any)
  }

  getAccessStrategy<Service extends ServiceName>(service?: Service): ServiceStrategy<Service, string, unknown> | undefined {
    if (!service) {
      throw new Error('Service must be specified in the query')
    }
    return this.strategies.get(service) as any
  }

  async find(params?: ServiceParams): Promise<Access[]> {
    const { entityId, service, action } = params?.query || {}
    const services = service
      ? [service]
      : Array.from(this.strategies.keys()) as ServiceName[]

    const results = await Promise.all(
      services.map(serviceName => this.findServiceAccess(serviceName, action, entityId, params?.user))
    )
    return results.flat()
  }

  async findServiceAccess(serviceName: ServiceName, action?: string, entityId?: string, user?: any): Promise<Access[]> {
    const strategy = this.getAccessStrategy(serviceName)
    if (!strategy) {
      return []
    }

    const actions = action
      ? { [action]: strategy.actions[action] }
      : strategy.actions
    const query: ActionPermissionQuery<ServiceName> = {
      app: this.options.app,
      user,
      serviceName,
      service: this.options.app.service(serviceName),
      entityId,
      data: undefined,
      action: '',
    }
    query.data = await strategy?.initRequestData?.(query)

    return Promise.all(
      Object.entries(actions).map(async ([actionName, { validity, appliesTo, hasPermission }]) => {
        query.action = actionName
        const allowed = validity === 'global' || entityId
          ? await hasPermission(query)
          : 'UNKNOWN' as const

        return {
          service: serviceName,
          action: actionName,
          entityId, validity, appliesTo, allowed,
        }
      })
    )
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
