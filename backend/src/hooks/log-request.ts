import { pick } from 'es-toolkit'
import type { HookContext, NextFunction } from '../declarations'
import { hasRequest, withRequestLogger } from '../requestLogger'
import { NotAuthenticated } from '@feathersjs/errors'

interface LogRequestOptions {
  ignoredPaths?: string[]
}

export const logRequest = ({ ignoredPaths = [] }: LogRequestOptions = {}) => async (context: HookContext, next: NextFunction) => {
  const callIgnored = ignoredPaths?.includes(context.path) || context.method === 'getMiddleware'
  if (callIgnored) {
    return next()
  }
  if (hasRequest()) {
    return next()
  }
  return withRequestLogger(context, async logger => {
    logger.logData('provider', context.params.provider ?? 'internal')
    logger.logData('connection-id', context.params.connection.id)
    try {
      return await next()
    } catch (error: any) {
      const includeStack = !(error instanceof NotAuthenticated)
      logger.logError(error, includeStack)
    } finally {
      logger.logData('user', context.params.user ? pick(context.params.user, ['_id', 'username', 'name']) : undefined)
      logger.logData('statusCode', context.http?.status)
    }
  })
}
