// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Access, AccessQuery, ServiceName } from './access.schema'
import { AccessStrategy, AccessStrategyDataStore, Action } from './strategies'
import { AccessDataStoreFactory } from './accessDataStore'
import { Validator } from '@feathersjs/schema'

export type { Access, AccessQuery }

export interface AccessServiceOptions {
  app: Application
}

export interface AccessParams extends Params<AccessQuery> {}

export class AccessService<ServiceParams extends AccessParams = AccessParams>
  implements ServiceInterface<Access, never, ServiceParams, never>
{
  private strategies: Map<ServiceName, AccessStrategy<unknown>> = new Map()
  private storeFactory: AccessDataStoreFactory
  getStore: AccessDataStoreFactory['getStore']

  constructor(public options: AccessServiceOptions) {
    this.storeFactory = new AccessDataStoreFactory(options.app)
    this.getStore = this.storeFactory.getStore.bind(this.storeFactory)
  }

  setAccessStrategy<Service extends ServiceName, Data>(
    service: Service,
    strategy: AccessStrategy<Data>
  ) {
    this.strategies.set(service, strategy as any)
    strategy.initialize?.({
      app: this.options.app,
      serviceName: service,
    })
  }

  getAccessStrategy<Service extends ServiceName>(service: Service): AccessStrategy<unknown> | undefined {
    return this.strategies.get(service)
  }

  async find(params?: ServiceParams): Promise<Access[]> {
    const { entityId, service, action } = params?.query || {}
    const services = service
      ? [service]
      : Array.from(this.strategies.keys()) as ServiceName[]

    const results = await Promise.all(
      services.map(serviceName => this.findServiceAccess(serviceName, action as Action, entityId, params?.user))
    )
    return results.flat()
  }

  async findServiceAccess(serviceName: ServiceName, actionQuery?: Action, entityId?: string, user?: any): Promise<Access[]> {
    const strategy = this.getAccessStrategy(serviceName)
    if (!strategy) {
      return []
    }

    const actions: Action[] = actionQuery
      ? [actionQuery]
      : ['read', 'create', 'update', 'remove', 'manage-access']

    return Promise.all(
      actions.map(async (action) => {
        const { hasPermission, ...authorization }= await strategy.authorize(action, user, entityId)

        return {
          service: serviceName,
          action: action,
          entityId,
          allowed: hasPermission ? 'GRANT' : 'DENY',
          ...authorization,
        }
      })
    )
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
