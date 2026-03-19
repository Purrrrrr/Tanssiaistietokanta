import { HookContext, NextFunction } from '../../declarations'
import { ServiceName } from './access.schema'
import { AsyncLocalStorage } from 'async_hooks'
import { RequestData } from './strategies'
import { User } from './types'
import { isJsonPatch, getPatched } from '../../hooks/merge-json-patch'
import { isEqual } from 'es-toolkit'
import { Forbidden } from '@feathersjs/errors'

export const SkipAccessControl = Symbol('SkipAccessControl')
export const AddAccessControlData = Symbol('AddAccessControlData')
export const PreviousAccessControl = Symbol('PreviousAccessControl')

interface AccessParamContext {
  user?: User
}

declare module '@feathersjs/feathers' {
  interface Params {
    [SkipAccessControl]?: boolean
    [AddAccessControlData]?: boolean
  }
}

const paramStorage = new AsyncLocalStorage<AccessParamContext>()

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { path, method, id } = ctx
  const accessService = ctx.app.service('access')
  // Some internal service calls need to have full access, eg. the dependecy graph
  const skipAuth = ctx.params[SkipAccessControl] === true
  const shouldAddAccessData = ctx.params[AddAccessControlData] !== false
  const strategy = accessService.getAccessStrategy(path as ServiceName)
  if (!strategy) {
    return next()
  }
  if (ctx.params.authenticated !== true && path !== 'authentication' && paramStorage.getStore()?.user === undefined) {
    const strategies = strategy.allowAuth?.(method) ?? []
    if (strategies.length > 0) {
      await auth(ctx, strategies)
    }
  }

  return withAccessParams({ user: ctx.params.user }, async ({ user }) => {
    if (!await strategy.authorizeRequest(toRequestData(ctx), user, skipAuth)) {
      throw new Forbidden(`Access denied to ${path}/${id ?? ''} for method ${method}`)
    }

    if (method === 'find') {
      await next()
      const result = ctx.result
      if (!Array.isArray(result)) {
        return
      }
      ctx.result = authorizeList(result, shouldAddAccessData, async entity => {
        const entityData = await strategy.store?.getAccess(entity._id)
        const ownerData = entity._id // Sometimes entities are queried without an id, eg. in some grahpql resolvers
          ? await strategy.getEntityOwner?.(entity._id)
          : undefined
        const hasPermission = await strategy.authorize({
          skipAuth,
          action: 'read',
          entityData,
          user,
          ...ownerData,
        })
        return { entityData: entityData, hasPermission }
      })
      return
    }

    if (!strategy.store) {
      return next()
    }

    let currentAccessControl = id ? await strategy.store.getAccess(id as string) : undefined
    const updatedAccessControl = getAccessControlUpdate(ctx, strategy)

    await next()

    if (updatedAccessControl && !isEqual(currentAccessControl, updatedAccessControl)) {
      const accessId = method === 'create' ? ctx.result._id : id
      ctx.params[PreviousAccessControl] = currentAccessControl

      strategy.store.dataValidator(updatedAccessControl)
      if (method !== 'create') {
        const hasManagePermission = await strategy.authorize({
          action: 'manage-access', user, entityData: currentAccessControl, skipAuth,
        })
        if (!hasManagePermission) {
          throw new Forbidden(`Manage access denied to ${path}/${accessId} for method ${method}`)
        }
      }
      await strategy.store.setAccess(accessId as string, updatedAccessControl)
      accessService.emit('updated', { service: path, id, accessData: updatedAccessControl })
      currentAccessControl = updatedAccessControl
    }

    if (shouldAddAccessData) ctx.result = addAccessData(ctx.result, currentAccessControl)
  })
}

async function authorizeList<T, R>(list: T[], shouldAddAccessData: boolean, authorizer: (item: T) => Promise<{ hasPermission?: boolean, entityData: R }>): Promise<T[]> {
  const authorized = await Promise.all(
    list.map(async item => {
      const { entityData, hasPermission } = await authorizer(item)
      if (!hasPermission) {
        return null
      }
      return shouldAddAccessData
        ? addAccessData(item, entityData)
        : item
    }),
  )
  return authorized.filter(item => item !== null)
}

function addAccessData<T>(result: T, data: unknown): T {
  if (data === undefined) {
    return result
  }
  return { ...result, accessControl: data } as T
}

function getAccessControlUpdate(ctx: HookContext, previousData?: unknown): unknown {
  const { data } = ctx
  if (!data) return undefined

  if ('accessControl' in data) {
    const accessControlData = data.accessControl
    delete data.accessControl
    return accessControlData
  }
  if (previousData && typeof previousData === 'object' && 'accessControl' in previousData && isJsonPatch(ctx)) {
    const patch = data.filter((op: any) => op.path.startsWith('/accessControl'))
    ctx.data = data.filter((op: any) => !op.path.startsWith('/accessControl'))
    return getPatched({ accessControl: previousData.accessControl }, patch).accessControl
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
      return { path: path as ServiceName, method, params, data }
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
