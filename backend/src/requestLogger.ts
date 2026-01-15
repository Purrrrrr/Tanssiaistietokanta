import { createLogger } from 'winston';
import { logger as mainLogger } from './logger'
import Transport from 'winston-transport';

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
  log(info: unknown, callback: () => void) {
    if (!request) {
      throw new Error('No active request to log message to')
    }
    request.data.messages ??= []
    request.data.messages.push(info)
    callback()
  }
}

let request: RequestLogger | undefined
export const logger = createLogger({
  level: mainLogger.level,
  transports: [new RequestMessageTransport()],
})

class RequestLogger {
  public data: LogData
  private startTime: Date

  constructor(context: RequestIdentity) {
    const { path = 'app', method, id } = context;
    this.startTime = new Date()
    this.data = {
      message: `${path} -> ${method}`,
      timestamp: this.startTime.toISOString(),
      method,
      path,
      id,
    }
  }

  logData(key: string, data: unknown) {
    this.data[key] = data;
  }

  logError(error: any, includeStack: boolean = true) {
    if (error instanceof Error) {
      this.data.error = error.message;
      this.data.errorLocation = error.stack?.split('\n')?.[1]?.replace(/^\s+at\s+/, '');
      if (includeStack) {
        this.data.errorStack = error.stack;
      }
    } else {
      this.data.error = String(error);
    }
  }

  writeRequest() {
    this.data.durationMs = new Date().getTime() - this.startTime.getTime();
    mainLogger.log(
      'error' in this.data ? 'error' : 'info',
      this.data,
    );
  }
}

export function hasRequest(): boolean {
  return request !== undefined
}

export function initializeRequest(context: RequestIdentity, initialData: Record<string, unknown> = {}): RequestLogger {
  if (request !== undefined) {
    return request
  }
  request = new RequestLogger(context)
  request.data = { ...request.data, ...initialData }

  return request
}
export function finalizeRequest() {
  request?.writeRequest()
  request = undefined
}

export function addLogData(key: string, data: unknown) {
  if (request) {
    request.logData(key, data)
  }
}

export function withRequestLogging<Args extends unknown[], Result extends unknown>(
  context: RequestIdentity,
  fn: (...args: Args) => Promise<Result>
): ((...args: Args) => Promise<Result>) {
  return async (...args: Args): Promise<Result> => {
    if (request !== undefined) {
      return fn(...args)
    }
    
    const logger = initializeRequest(context)
    try {
      return await fn(...args)
    } catch (error: any) {
      logger.logError(error)
      throw error
    } finally {
      finalizeRequest()
    }
  }
}
