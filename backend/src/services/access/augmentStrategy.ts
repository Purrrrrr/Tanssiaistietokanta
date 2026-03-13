import { AuthTarget, ServiceName } from './access.schema'
import { ServiceCreateData, User } from './types'
import { AccessStrategy, Action, AuthResponse, RequestData } from './strategies'

export interface AugmentedAccessStrategy<Service extends ServiceName = ServiceName, EntityAccessData = unknown, ExtraAction extends string = never> extends AccessStrategy<Service, EntityAccessData, ExtraAction> {
  authTarget: (action: Action) => AuthTarget
  authorizeRequest(request: RequestData<Service>, user: User | undefined): Promise<AuthResponse>
}

export function augmentStrategy<Service extends ServiceName, EntityAccessData, ExtraAction extends string>(
  strategy: AccessStrategy<Service, EntityAccessData, ExtraAction>,
): AugmentedAccessStrategy<Service, EntityAccessData, ExtraAction> {
  const { authTarget } = strategy

  const ownerDataFromRequest = async (request: RequestData<Service>) => {
    if (request.method === 'create') {
      return strategy.getOwnerFromData?.(request.data as ServiceCreateData<Service>)
    }
    if (request.id) {
      return strategy.getEntityOwner?.(request.id)
    }
  }

  const augmented: AugmentedAccessStrategy<Service, EntityAccessData, ExtraAction> = Object.assign(strategy, {
    authorizeRequest: async (request: RequestData<Service>, user: User | undefined) => {
      const actions = strategy.requestToActions?.(request) ?? defaultRequestToActions(request)
      const requestOwnerData = await ownerDataFromRequest(request)
      const entityData = request.id
        ? await strategy.store?.getAccess(request.id)
        : undefined
      const results = await Promise.all(actions.map(action => {
        return strategy.authorize({
          action,
          user,
          entityData,
          ...requestOwnerData,
        })
      }))
      return results.every(result => result === true)
    },
    authTarget: typeof authTarget === 'function'
      ? authTarget
      : () => authTarget,
  })
  return augmented
}

export function defaultRequestToActions(request: RequestData<ServiceName>): Action[] {
  switch (request.method) {
    case 'find':
      return ['list']
    case 'get':
      return ['read']
    case 'create':
      return ['create']
    case 'update':
    case 'patch':
      return ['modify']
    case 'remove':
      return ['delete']
    default:
      return []
  }
}
