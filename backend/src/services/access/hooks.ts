import { HookContext, NextFunction } from '../../declarations'
import { ServiceName } from './access.schema'
import { AsyncLocalStorage } from 'async_hooks'
import { Action } from './strategies'
import { User } from './types'
import { isJsonPatch, getPatched } from '../../hooks/merge-json-patch'

export const SkipAccessControl = Symbol('SkipAccessControl')
export const PreviousAccessControl = Symbol('PreviousAccessControl')

interface AccessParamContext {
  user?: User
}

const paramStorage = new AsyncLocalStorage<AccessParamContext>()

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { app, params, path, method, id } = ctx
  const accessService = app.service('access')
  if (params[SkipAccessControl]) {
    // Some internal service calls need to have full access, eg. the dependecy graph
    return next()
  }

  return withAccessParams({ user: params.user }, async ({ user }) => {
    const stragegy = accessService.getAccessStrategy(path as ServiceName)
    if (!stragegy) {
      return next()
    }

    if (method === 'find') {
      await next()
      const result = ctx.result
      if (!Array.isArray(result)) {
        return
      }
      ctx.result = authorizeList(result, async entity => {
        const entityData = await stragegy.store?.getAccess(entity._id)
        const hasPermission = await stragegy.authorizeEntity({
          action: 'read',
          entityData,
          user,
        })
        return { entityData: entityData, hasPermission }
      })
      return
    }
    const action = toAction(method)
    if (!action) {
      return next()
    }

    let entityData = await stragegy.store?.getAccess(id as string)
    const hasPermission = await stragegy.authorizeEntity({ action, user, entityData })
    if (!hasPermission) {
      throw new Error('Access denied')
    }

    if (stragegy.store) {
      const updatedData = getAccessControlUpdate(ctx, entityData)

      if (updatedData) {
        ctx.params[PreviousAccessControl] = entityData
        const hasManagePermission = await stragegy.authorizeEntity({
          action: 'manage-access', user, entityData,
        })
        if (!hasManagePermission) {
          throw new Error('Manage access denied')
        }
        stragegy.store.dataValidator(updatedData)
        await stragegy.store.setAccess(id as string, updatedData)
        entityData = updatedData
      }
    }

    await next()
    ctx.result = addAccessData(ctx.result, entityData)
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

function toAction(method: string): Action | null {
  switch (method) {
    case 'get':
      return 'read'
    case 'update':
    case 'patch':
      return 'update'
    case 'remove':
      return 'remove'
    default:
      return null
  }
}
