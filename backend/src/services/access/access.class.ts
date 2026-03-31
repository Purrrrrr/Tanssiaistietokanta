// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application, HookContext } from '../../declarations'
import type { Access, AccessQuery, ServiceName } from './access.schema'
import { Channel } from '@feathersjs/transport-commons'
import { AccessStrategy, Action } from './strategies'
import { AugmentedAccessStrategy, augmentStrategy } from './augmentStrategy'
import { AccessDataStoreFactory } from './accessDataStore'
import { logger } from '../../logger'
import { PreviousAccessControl } from './hooks'
import { ServiceCreateData, User } from './types'

export type { Access, AccessQuery }

// Extendable interface for declaring extra actions per service, via declaration merging.
// Example (in events.ts):
//   declare module '../access/access.class' {
//     interface ServiceExtraActions { events: 'modify-volunteers' }
//   }
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ServiceExtraActions {}
export type ServiceExtraActionsFor<S extends ServiceName> = S extends keyof ServiceExtraActions ? ServiceExtraActions[S] : never
export type ServiceAllActions<S extends ServiceName> = Action | ServiceExtraActionsFor<S>

export interface AccessServiceOptions {
  app: Application
}

const EMPTY_CHANNEL = new Channel()

export interface AccessParams extends Params<AccessQuery> {}

export class AccessService<ServiceParams extends AccessParams = AccessParams>
implements ServiceInterface<Access, never, ServiceParams, never> {
  private strategies = new Map<ServiceName, AugmentedAccessStrategy<ServiceName, unknown>>()
  private storeFactory: AccessDataStoreFactory
  getStore: AccessDataStoreFactory['getStore']

  constructor(public options: AccessServiceOptions) {
    this.storeFactory = new AccessDataStoreFactory(options.app)
    this.getStore = this.storeFactory.getStore.bind(this.storeFactory)
  }

  setAccessStrategy<Service extends ServiceName, Data, ExtraActions extends ServiceExtraActionsFor<Service> = never>(
    service: Service,
    strategy: AccessStrategy<Service, Data, ExtraActions>,
  ) {
    this.strategies.set(service, augmentStrategy(strategy) as any)
    strategy.initialize?.({
      app: this.options.app,
      serviceName: service,
    })
  }

  getAccessStrategy<Service extends ServiceName>(service: Service): AugmentedAccessStrategy<ServiceName, unknown> | undefined {
    return this.strategies.get(service)
  }

  async find(params?: ServiceParams): Promise<Access[]> {
    if (params?.query?.queries) {
      const results = await Promise.all(
        params.query.queries.map(query => this.findQuery(query, params?.user)),
      )
      return results.flat()
    }
    return this.findQuery(params?.query, params?.user)
  }

  async findQuery(query: AccessQuery = {}, user: User | undefined) {
    const { entityId, service, action, owner, owningId } = query
    const services = service
      ? [service]
      : Array.from(this.strategies.keys()) as ServiceName[]

    const results = await Promise.all(
      services.map(serviceName => this.findServiceAccess(serviceName, action as Action, entityId, user, owner, owningId)),
    )
    return results.flat()
  }

  async findServiceAccess(serviceName: ServiceName, actionQuery?: Action, entityId?: string, user?: User, owner?: ServiceName, owningId?: string): Promise<Access[]> {
    const strategy = this.getAccessStrategy(serviceName)
    if (!strategy) {
      return []
    }

    const actions: (Action)[] = actionQuery
      ? [actionQuery]
      : ['list', 'read', 'create', 'modify', 'delete', 'manage-access', ...strategy.extraActions ?? []]

    return Promise.all(
      actions.map(async (action) => {
        const hasPermission = await this.getAccess(strategy, action, user, entityId, owner, owningId)
        return {
          service: serviceName,
          action: action,
          entityId,
          owner,
          owningId,
          allowed: hasPermissionToGrant(hasPermission),
          target: strategy.authTarget(action),
        }
      }),
    )
  }

  async hasAccess<S extends ServiceName>(serviceName: S, action: ServiceAllActions<S>, user?: User, entityId?: Id, owner?: ServiceName, owningId?: Id): Promise<boolean | undefined> {
    const strategy = this.getAccessStrategy(serviceName)
    return strategy
      ? this.getAccess(strategy, action as Action, user, entityId, owner, owningId)
      : true
  }

  private async getAccess(strategy: AugmentedAccessStrategy, action: Action, user?: User, entityId?: Id, owner?: ServiceName, owningId?: Id): Promise<boolean | undefined> {
    const entityData = entityId
      ? await strategy.store?.getAccess(entityId)
      : undefined
    return strategy.authorize({
      action: action as Action, user, entityData, owner, owningId,
    })
  }

  async handlePublish<T>(
    data: T,
    channels: Channel | Channel[],
    context: HookContext,
  ): Promise<Channel | Channel[]> {
    if (Array.isArray(data)) {
      logger.error('AccessService.publish does not support publishing arrays of data.', { data })
      return channels
    }
    const service = context.path as ServiceName
    const strategy = this.getAccessStrategy(service)
    logger.debug('AccessService.handlePublish called.', { path: context.path, event: context.event, hasStrategy: !!strategy })
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
    logger.debug('Checking permissions for connections', { entityId, entityData, numConnections: channelConnections.length })
    const ownerData = strategy.getOwnerFromData?.(data as ServiceCreateData<ServiceName>)

    return Promise.all(
      channelConnections.map(async (c) => {
        const { user } = c.connection
        const hasPermission = await strategy.authorize({ action: 'read', user, entityData, ...ownerData })

        if (hasPermission) {
          logger.debug('Has permission to access entity', { entityId, user })
          return new Channel([c.connection], c.data)
        }
        if (previousAccessData) {
          logger.debug('Had permission to access entity', { entityId, user })
          const hadPermission = await strategy.authorize({ action: 'read', user, entityData: previousAccessData, ...ownerData })
          if (hadPermission) {
            // Send minimal data to indicate that the entity is now inaccessible
            return new Channel([c.connection], { _id: entityId, inaccessible: true })
          }
        }
        logger.debug('No permission to access entity', { entityId, user })
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
