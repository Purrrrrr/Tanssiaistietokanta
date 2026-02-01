import { HookContext, NextFunction } from "../../declarations";
import { ServiceName } from "./access.schema";
import { AsyncLocalStorage } from 'async_hooks';
import { AccessStrategy, AccessStrategyDataStore, Action } from "./strategies";
import { User } from "./types";
import { isJsonPatch, getPatched } from "../../hooks/merge-json-patch";

export const SkipAccessControl = Symbol('SkipAccessControl');

interface AccessParamContext {
  user?: User
}

const paramStorage = new AsyncLocalStorage<AccessParamContext>();

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { app, params, path, method, id, data } = ctx;
  const accessService = app.service('access');
  if (params[SkipAccessControl]) {
    // Some internal service calls need to have full access, eg. the dependecy graph
    return next();
  }

  return withAccessParams({ user: params.user }, async ({ user })=> {
    const stragegy = accessService.getAccessStrategy(path as ServiceName);
    if (!stragegy) {
      return next()
    }

    if (method === 'find') {
      await next()
      const result = ctx.result
      if (!Array.isArray(result)) {
        return
      }
      const authorizedEntities = await Promise.all(
        result.map(async entity => {
          const accessData = await stragegy.store?.getAccess(entity._id)
          const authorization = await stragegy.authorize('read', user, entity._id, accessData)
          return authorization.hasPermission
            ? { ...entity, accessControl: accessData }
            : null
        })
      )
      ctx.result = authorizedEntities.filter(e => e !== null)
      return
    }
    const action = toAction(method);
    if (!action) {
      return next()
    }

    let accessData = await stragegy.store?.getAccess(id as string)
    const authorization = await stragegy.authorize(action, user, id, accessData)
    if (!authorization.hasPermission) {
      throw new Error('Access denied');
    }

    if (stragegy.store && data) {
      async function updateAccessData(stragegy: AccessStrategy<unknown>, store: AccessStrategyDataStore<unknown>, updatedData: unknown) {
        const manageAccessAuth = await stragegy.authorize('manage-access', user, id, accessData)
        if (!manageAccessAuth.hasPermission) {
          throw new Error('Manage access denied');
        }
        console.log('Storing access control data', updatedData)
        store.dataValidator(updatedData)
        await store.setAccess(id as string, updatedData)
        accessData = updatedData
      }

      if ('accessControl' in data) {
        updateAccessData(stragegy, stragegy.store, data.accessControl)
        delete data.accessControl
      }
      if (isJsonPatch(ctx)) {
        const patch = data.filter((op: any) => op.path.startsWith('/accessControl'))
        const accessControlPatch = getPatched({ accessControl: accessData }, patch).accessControl
        updateAccessData(stragegy, stragegy.store, accessControlPatch)

        ctx.data = data.filter((op: any) => !op.path.startsWith('/accessControl'))
        if (ctx.data.length === 0) {
          // Prevent empty patch from creating an entity version
          ctx.params.jsonPatch = false
          ctx.data = {}
        }
      }
    }

    await next()
    const result = ctx.result
    ctx.result = {
      ...result,
      accessControl: accessData
    }
  })
}

export function withAccessParams<T>(
  context: AccessParamContext,
  fn: (ctx: AccessParamContext) => Promise<T>
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
