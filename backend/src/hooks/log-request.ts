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
    const { app, params } = context
    const { connection, provider, sessionId } = params
    logger.logData('provider', provider ?? 'internal')
    logger.logData('sessionId',  connection?.sessionId ?? sessionId)
    logger.logData('instanceId', app.get('instanceId'))
    logger.logData('connectionId', connection?.id)
    try {
      return await next()
    } catch (error: any) {
      const includeStack = !(error instanceof NotAuthenticated)
      logger.logError(error, includeStack)
    } finally {
      // Intentionally pick user from params here because it's not set earlier
      logger.logData('user', params.user ? pick(params.user, ['_id', 'username', 'name', 'sessionId']) : undefined)
      logger.logData('statusCode', context.http?.status)
    }
  })
}
