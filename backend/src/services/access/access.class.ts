// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application, HookContext } from '../../declarations'
import type { Access, AccessQuery, ServiceName } from './access.schema'
import { Channel } from '@feathersjs/transport-commons'
import { AccessStrategy, AugmentedAccessStrategy, augmentStrategy, GlobalAction, Action as EntityAction } from './strategies'
import { AccessDataStoreFactory } from './accessDataStore'
import { logger } from '../../requestLogger'
import { PreviousAccessControl } from './hooks'

export type { Access, AccessQuery }

export interface AccessServiceOptions {
  app: Application
}

const EMPTY_CHANNEL = new Channel()

export interface AccessParams extends Params<AccessQuery> {}

export class AccessService<ServiceParams extends AccessParams = AccessParams>
implements ServiceInterface<Access, never, ServiceParams, never> {
  private strategies = new Map<ServiceName, AugmentedAccessStrategy<unknown>>()
  private storeFactory: AccessDataStoreFactory
  getStore: AccessDataStoreFactory['getStore']

  constructor(public options: AccessServiceOptions) {
    this.storeFactory = new AccessDataStoreFactory(options.app)
    this.getStore = this.storeFactory.getStore.bind(this.storeFactory)
  }

  setAccessStrategy<Service extends ServiceName, Data>(
    service: Service,
    strategy: AccessStrategy<Data>,
  ) {
    this.strategies.set(service, augmentStrategy(strategy) as any)
    strategy.initialize?.({
      app: this.options.app,
      serviceName: service,
    })
  }

  getAccessStrategy<Service extends ServiceName>(service: Service): AugmentedAccessStrategy<unknown> | undefined {
    return this.strategies.get(service)
  }

  async find(params?: ServiceParams): Promise<Access[]> {
    const { entityId, service, action } = params?.query ?? {}
    const services = service
      ? [service]
      : Array.from(this.strategies.keys()) as ServiceName[]

    const results = await Promise.all(
      services.map(serviceName => this.findServiceAccess(serviceName, action as GlobalAction | EntityAction, entityId, params?.user)),
    )
    return results.flat()
  }

  async findServiceAccess(serviceName: ServiceName, actionQuery?: GlobalAction | EntityAction, entityId?: string, user?: any): Promise<Access[]> {
    const strategy = this.getAccessStrategy(serviceName)
    if (!strategy) {
      return []
    }

    const actions: (GlobalAction | EntityAction)[] = actionQuery
      ? [actionQuery]
      : ['read', 'create', 'update', 'remove', 'manage-access']

    return Promise.all(
      actions.map(async (action) => {
        const hasPermission = entityId && action !== 'create'
          ? await strategy.authorizeEntity({
            action, user, entityData: await strategy.store?.getAccess(entityId),
          })
          : await strategy.authorizeGlobal({ action, user })

        return {
          service: serviceName,
          action: action,
          entityId,
          allowed: hasPermissionToGrant(hasPermission),
          target: entityId ? 'entity' : 'everything',
        }
      }),
    )
  }

  async handlePublish<T>(
    data: T,
    channels: Channel | Channel[],
    context: HookContext
  ): Promise<Channel | Channel[]> {
    if (Array.isArray(data)) {
      logger.error('AccessService.publish does not support publishing arrays of data.', { data })
      return channels
    }
    const service = context.path as ServiceName
    const strategy = this.getAccessStrategy(service)
    if (!strategy) {
      return channels
    }

    const entityId = (data as any)._id as Id
    if (!entityId) {
      logger.error('AccessService.publish does not support publishing data withoud _id.', { data })
      return channels
    }
    const previousAccessData = context.params[PreviousAccessControl]
    const entityData = await strategy.store?.getAccess(entityId)
    const channelList = Array.isArray(channels) ? channels : [channels]

    const channelConnections = channelList.flatMap(channel =>
      channel.connections.map(connection => ({
        connection,
        data: channel.data,
      })),
    )

    return Promise.all(
      channelConnections.map(async (c) => {
        const { user } = c.connection
        const hasPermission = await strategy.authorizeEntity({ action: 'read', user, entityData })

        if (hasPermission) {
          logger.info('Has permission to access entity', { entityId, user: user?._id })
          return new Channel([c.connection], c.data)
        }
        if (previousAccessData) {
          logger.info('Had permission to access entity', { entityId, user: user?._id })
          const hadPermission = await strategy.authorizeEntity({ action: 'read', user, entityData: previousAccessData })
          if (hadPermission) {
            // Send minimal data to indicate that the entity is now inaccessible
            return new Channel([c.connection], { _id: entityId, inaccessible: true })
          }
        }
        logger.info('No permission to access entity', { entityId, user: user?._id })
        return EMPTY_CHANNEL
      }),
    )
  }
}

function hasPermissionToGrant(hasPermission: boolean | undefined): 'GRANT' | 'DENY' | 'UNKNOWN' {
  if (hasPermission === undefined) {
    return 'UNKNOWN'
  }
  return hasPermission ? 'GRANT' : 'DENY'
}

export const getOptions = (app: Application) => {
  return { app }
}
