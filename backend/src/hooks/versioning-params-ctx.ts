import type { HookContext, NextFunction } from '../declarations'
import { AsyncLocalStorage } from 'node:async_hooks'

interface AtDateContext {
  atDateValue?: string
}

const storage = new AsyncLocalStorage<AtDateContext>()

export const initVersioningParamsCtx = async (_ctx: HookContext, next: NextFunction) => {
  if (storage.getStore()) {
    return next()
  }
  const ret = await runWithAtDateParam(next)
  return ret
}

export function runWithAtDateParam<T>(fn: () => Promise<T>): Promise<T> {
  return storage.run({}, fn)
}

export function setAtDateParam(atDate: string) {
  const store = storage.getStore()
  if (!store) {
    throw new Error('No context available. Make sure to call setAtDateParam within a hook that runs after initVersioningParamsCtx.')
  }
  // Never set atDateValue if it already exists, to ensure that the first value is preserved in multiple calls
  store.atDateValue ??= atDate
}

export function getAtDateParam(): string | undefined {
  return storage.getStore()?.atDateValue
}
