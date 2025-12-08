import type { HookContext, NextFunction } from '../declarations'

export class ErrorWithStatus<T> extends Error {
  constructor(public status: number, public result: T) {
    super()
  }
}

export const addErrorStatusCode = async (ctx: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (e) {
    if (!ctx.http) {
      throw e
    }
    if (e instanceof ErrorWithStatus) {
      ctx.http.status = e.status
      ctx.result = e.result
    } else if (typeof e === 'object' && e !== null && 'status' in e && typeof e.status === 'number') {
      ctx.http.status = e.status
    } else {
      throw e
    }
  }
}
