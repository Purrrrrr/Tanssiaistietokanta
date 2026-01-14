import { pick } from 'es-toolkit'
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'
import { NotAuthenticated } from '@feathersjs/errors'

interface LogRequestOptions {
  ignoredPaths?: string[]
}

let request: LogData | undefined

export const logRequest = ({ ignoredPaths = [] }: LogRequestOptions = {}) => async (context: HookContext, next: NextFunction) => {
  const startTime = new Date()
  const { id, method, path } = context
  const callIgnored = ignoredPaths?.includes(path) || method === 'getMiddleware'
  if (callIgnored) {
    return next()
  }
  const isOriginalCall = request === undefined

  request ??= {
    message: `${path} -> ${method}`,
    timestamp: startTime.toISOString(),
    provider: context.params.provider,
    method, path, id,
  } satisfies LogData

  try {
    await next()
  } catch (error: any) {
    request.error = error.message
    if (!(error instanceof NotAuthenticated)) {
      request.errorStack = error.stack
    }
    if (!isOriginalCall) {
      throw error
    }
  } finally {
    if (isOriginalCall) {
      request.user = context.params.user ? pick(context.params.user, ['_id', 'username', 'name']) : undefined
      request.statusCode = context.http?.status
      request.durationMs = new Date().getTime() - startTime.getTime()
      logger.log(
        'error' in request ? 'error' : 'info',
        request,
      )
      request = undefined
    }
  }
}

export function addLogData(key: string, data: unknown) {
  if (request) {
    request[key] = data
  }
}

export interface LogData extends Record<string, unknown> {
  message: string
  provider?: string
  statusCode?: number
  error?: string
  errorStack?: string
  timestamp: string
  durationMs?: number
  path: string
  method: string
  id?: string | number | null
  messages?: string[]
}
