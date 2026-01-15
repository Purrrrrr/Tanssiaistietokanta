import { pick } from 'es-toolkit'
import type { HookContext, NextFunction } from '../declarations'
import { hasRequest, initializeRequest, finalizeRequest } from '../requestLogger'
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
  const logger = initializeRequest(context, { provider: context.params.provider || 'internal' })

  try {
    await next()
  } catch (error: any) {
    const includeStack = !(error instanceof NotAuthenticated)
    logger.logError(error, includeStack)
  } finally {
    logger.logData('user', context.params.user ? pick(context.params.user, ['_id', 'username', 'name']) : undefined)
    logger.logData('statusCode', context.http?.status)
    finalizeRequest()
  }
}
