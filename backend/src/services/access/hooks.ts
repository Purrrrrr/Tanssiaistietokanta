import { HookContext, NextFunction } from "../../declarations";
import { ServiceName } from "./access.schema";
import { AsyncLocalStorage } from 'async_hooks';
import { PermissionQuery } from "./strategies";

type AccessParamContext = Pick<PermissionQuery, 'user'>

const paramStorage = new AsyncLocalStorage<AccessParamContext>();

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { app, params, service, path, method, id } = ctx;
  const accessService = app.service('access');

  return withAccessParams({ user: params.user }, async ({ user })=> {
    const stragegy = accessService.getAccessStrategy(path as ServiceName);
    if (!stragegy) {
      return next()
    }

    const authenticationFunction = stragegy.authenticate[method] ?? stragegy.authenticate['default'];
    if (!authenticationFunction) {
      return next()
    }
    const query = {
      app,
      ctx,
      user,
      service: service,
      serviceName: path as ServiceName,
      action: toAction(method),
      entityId: id as string | undefined,
    } as PermissionQuery

    let data: unknown
    query.canDo = async (action: string) => {
      if (stragegy.initRequestData && data === undefined) {
        data = await stragegy.initRequestData(query)
      }
      const permission = await stragegy.actions[action]?.hasPermission({
        ...query,
        data,
      })
      return permission === 'GRANT'
    }

    const result = await authenticationFunction(query)

    if (result === false || result === 'DENY') {
      throw new Error('Access denied');
    }

    if (stragegy.getFindQuery && (method === 'find' || method === 'get')) {
      const findQuery = await stragegy.getFindQuery(query)
      ctx.params.query ??= {}
      ctx.params.query = {
        ...ctx.params.query,
        ...findQuery,
      }
    }

    return next();
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

function toAction(method: string): string {
  switch (method) {
    case 'patch':
      return 'update'
    default:
      return method
  }
}
