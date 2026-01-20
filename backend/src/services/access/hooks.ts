import { HookContext, NextFunction } from "../../declarations";
import { ServiceName } from "./access.schema";
import { AsyncLocalStorage } from 'async_hooks';
import { PermissionQuery } from "./strategies";

type AccessParamContext = Pick<PermissionQuery, 'user'>

const paramStorage = new AsyncLocalStorage<AccessParamContext>();

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { app, params, path, method, id } = ctx;
  const accessService = app.service('access');

  return withAccessParams({ user: params.user }, async ({ user })=> {
    if (!accessService.hasStrategy(path)) {
      return next()
    }

    const res = await accessService.find({
      user,
      query: {
        service: path as ServiceName,
        action: toAction(method),
        entityId: id as string | undefined
      }
    });

    if (!res.allowed) {
      throw new Error('Access denied');
    }
    if (method === 'find' || method === 'get') {
      const query = await accessService.getListQuery({ user, service: path as ServiceName })
      ctx.params.query ??= {}
      ctx.params.query = {
        ...ctx.params.query,
        ...query,
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
