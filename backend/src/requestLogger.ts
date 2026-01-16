import { createLogger } from 'winston';
import { logger as mainLogger } from './logger'
import Transport from 'winston-transport';
import { AsyncLocalStorage } from 'async_hooks';

interface LogData extends Record<string, unknown>, RequestIdentity {
  message: string
  provider?: string
  statusCode?: number
  error?: string
  errorStack?: string
  timestamp: string
  durationMs?: number
  messages?: unknown[]
}

interface RequestIdentity {
  path?: string
  method: string
  id?: string | number | null
}

class RequestMessageTransport extends Transport {
  constructor() {
    super({})
  }
  log(info: any, callback: () => void) {
    const requestLogger = loggerStorage.getStore()
    if (!requestLogger) {
      throw new Error('No active request to log message to')
    }
    const now = new Date()
    info.timestamp = now.toISOString()
    info.time = now.getTime() - requestLogger.startTime.getTime()
    requestLogger.data.messages ??= []
    requestLogger.data.messages.push(info)
    callback()
  }
}

const loggerStorage = new AsyncLocalStorage<RequestLogger>();

export const logger = createLogger({
  level: mainLogger.level,
  transports: [new RequestMessageTransport()],
})

class RequestLogger {
  public data: LogData
  public startTime: Date

  constructor(context: RequestIdentity, initialData: Record<string, unknown> = {}) {
    const { path = 'app', method, id } = context
    this.startTime = new Date()
    this.data = {
      message: `${path} -> ${method}`,
      timestamp: this.startTime.toISOString(),
      method,
      path,
      id,
      ...initialData,
    }
  }

  logData(key: string, data: unknown) {
    this.data[key] = data
  }

  logError(error: any, includeStack: boolean = true) {
    if (error instanceof Error) {
      this.data.error = error.message
      this.data.errorLocation = error.stack?.split('\n')?.[1]?.replace(/^\s+at\s+/, '')
      if (includeStack) {
        this.data.errorStack = error.stack
      }
    } else {
      this.data.error = String(error)
    }
  }

  writeRequest() {
    this.data.durationMs = new Date().getTime() - this.startTime.getTime()
    mainLogger.log(
      'error' in this.data ? 'error' : 'info',
      this.data,
    )
  }
}

export function hasRequest(): boolean {
  return loggerStorage.getStore() !== undefined
}

export function addLogData(key: string, data: unknown) {
  loggerStorage.getStore()?.logData(key, data)
}

export function withRequestLogger<T>(
  context: RequestIdentity,
  fn: (logger: RequestLogger) => Promise<T>
): Promise<T> {
  const existingLogger = loggerStorage.getStore()
  if (existingLogger) {
    console.log('request already exists, skipping logger init')
    return fn(existingLogger)
  }

  const logger = new RequestLogger(context)
  return loggerStorage.run(logger, async () => {
    try {
      return await fn(logger)
    } catch (error) {
      logger.logError(error)
      throw error
    } finally {
      logger.writeRequest()
    }
  })
}

export function withRequestLogging<Args extends unknown[], Result extends unknown>(
  path: string,
  method: string,
  fn: (...args: Args) => Promise<Result>
): ((...args: Args) => Promise<Result>) {
  return async (...args: Args): Promise<Result> => {
    return withRequestLogger({ method, path }, async () => {
      return await fn(...args)
    }).catch(() => null as Result)
  }
}
