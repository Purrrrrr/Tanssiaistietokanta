import { HookContext, NextFunction } from "../../declarations";
import { ServiceName } from "./access.schema";

export async function checkAccess(ctx: HookContext, next: NextFunction) {
  const { app, params, path, method, id } = ctx;
  const accessService = app.service('access');
  
  if (!accessService.hasStrategy(path)) {
    return next()
  }
  
  const res = await accessService.find({
    user: params.user,
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
    const query = await accessService.getListQuery({ user: params.user, service: path as ServiceName })
    ctx.params.query ??= {}
    ctx.params.query = {
      ...ctx.params.query,
      ...query,
    }
  }

  return next();
}

function toAction(method: string): string {
  switch (method) {
    case 'patch':
      return 'update'
    default:
      return method
  }
}
