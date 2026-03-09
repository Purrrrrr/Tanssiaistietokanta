import { HookContext, NextFunction } from '../../declarations'
import { ServiceName } from './access.schema'
import { AsyncLocalStorage } from 'async_hooks'
import { RequestData } from './strategies'
import { User } from './types'
import { isJsonPatch, getPatched } from '../../hooks/merge-json-patch'
import { isEqual } from 'es-toolkit'

export const SkipAccessControl = Symbol('SkipAccessControl')
export const PreviousAccessControl = Symbol('PreviousAccessControl')

interface AccessParamContext {
  user?: User
}

declare module '@feathersjs/feathers' {
  interface Params {
    [SkipAccessControl]?: boolean
  }
}

const paramStorage = new AsyncLocalStorage<AccessParamContext>()

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { path, method, id } = ctx
  const accessService = ctx.app.service('access')
  if (ctx.params[SkipAccessControl]) {
    // Some internal service calls need to have full access, eg. the dependecy graph
    return next()
  }
  const strategy = accessService.getAccessStrategy(path as ServiceName)
  if (!strategy) {
    return next()
  }
  if (ctx.params.authenticated !== true && path !== 'authentication') {
    const strategies = strategy.allowAuth?.(method) ?? []
    if (strategies.length > 0) {
      await auth(ctx, strategies)
    }
  }

  return withAccessParams({ user: ctx.params.user }, async ({ user }) => {
    if (!await strategy.authorizeRequest(toRequestData(ctx), user)) {
      throw new Error('Access denied')
    }

    if (method === 'find') {
      await next()
      const result = ctx.result
      if (!Array.isArray(result)) {
        return
      }
      ctx.result = authorizeList(result, async entity => {
        const entityData = await strategy.store?.getAccess(entity._id)
        const ownerData = entity._id // Sometimes entities are queried without an id, eg. in some grahpql resolvers
          ? await strategy.getEntityOwner?.(entity._id)
          : undefined
        const hasPermission = await strategy.authorize({
          action: 'read',
          entityData,
          user,
          ...ownerData,
        })
        return { entityData: entityData, hasPermission }
      })
      return
    }

    await next()

    if (id && strategy.store) {
      let entityData = await strategy.store?.getAccess(id as string)
      const updatedData = getAccessControlUpdate(ctx, entityData)

      if (updatedData) {
        ctx.params[PreviousAccessControl] = entityData
        const hasManagePermission = await strategy.authorize({
          action: 'manage-access', user, entityData,
        })
        if (!hasManagePermission) {
          throw new Error('Manage access denied')
        }
        strategy.store.dataValidator(updatedData)
        await strategy.store.setAccess(id as string, updatedData)
        if (!isEqual(entityData, updatedData)) {
          accessService.emit('updated', { service: path, id, accessData: updatedData })
        }
        entityData = updatedData
      }
      ctx.result = addAccessData(ctx.result, entityData)
    }
  })
}

async function authorizeList<T, R>(list: T[], authorizer: (item: T) => Promise<{ hasPermission?: boolean, entityData: R }>): Promise<T[]> {
  const authorized = await Promise.all(
    list.map(async item => {
      const { entityData, hasPermission } = await authorizer(item)
      return hasPermission
        ? addAccessData(item, entityData)
        : null
    }),
  )
  return authorized.filter(item => item !== null)
}

function addAccessData<T>(result: T, data: unknown): T {
  return { ...result, accessControl: data } as T
}

function getAccessControlUpdate<T>(ctx: HookContext, entityData: T): T | undefined {
  const { data } = ctx
  if (!data) return undefined

  if ('accessControl' in data) {
    const accessControlData = data.accessControl
    delete data.accessControl
    return accessControlData
  }
  if (isJsonPatch(ctx)) {
    const patch = data.filter((op: any) => op.path.startsWith('/accessControl'))
    ctx.data = data.filter((op: any) => !op.path.startsWith('/accessControl'))
    return getPatched({ accessControl: entityData }, patch).accessControl
  }
  return undefined
}

export function withAccessParams<T>(
  context: AccessParamContext,
  fn: (ctx: AccessParamContext) => Promise<T>,
): Promise<T> {
  const existingCtx = paramStorage.getStore()
  if (existingCtx) {
    return fn(existingCtx)
  }

  return paramStorage.run(context, async () => {
    return await fn(context)
  })
}

function toRequestData(ctx: HookContext): RequestData<ServiceName> {
  const { path, method, id, params, data } = ctx
  switch (method) {
    case 'find':
      return { path: path as ServiceName, method, params }
    case 'get':
    case 'remove':
      if (!id) {
        break
      }
      return { path: path as ServiceName, method, id, params }
    case 'create':
    case 'update':
    case 'patch':
      if (!id) {
        break
      }
      return { path: path as ServiceName, method, id, params, data }
    default:
  }
  return { path: path as ServiceName, method: 'unknown', methodName: method, id, params, data }
}

const auth = async (context: HookContext, strategies: string[]) => {
  const { app, params } = context
  const { authentication } = params
  const authService = app.service('authentication')

  if (params.authenticated === true) {
    return
  }

  if (authentication) {
    const { authentication, ...authParams } = params
    const authResult = await authService.authenticate(authentication, authParams, ...strategies)
    const { accessToken: _token, ...authResultWithoutToken } = authResult

    context.params = {
      ...params,
      ...authResultWithoutToken,
      authenticated: true,
    }
  }
}
