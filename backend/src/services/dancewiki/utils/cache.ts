export interface Cache<T> {
  get(): Promise<T>
  getIfExists(): T | null
  isValid(): boolean
  invalidate(): void
}

interface CacheData<T> {
  result: T | null
  fetchedAt: number | null
  pendingPromise: Promise<T> | null
}

const emptyData = {
  result: null,
  fetchedAt: null,
  pendingPromise: null,
}

export function createCache<T>(getData: () => Promise<T>, expireTimeInMs: number): Cache<T> {
  let cacheData : CacheData<T> = emptyData

  const isExpired = () =>
    !cacheData.fetchedAt || cacheData.fetchedAt < now() - expireTimeInMs
  const isValid = () => cacheData.result !== null && !isExpired

  async function fillCache() {
    cacheData.pendingPromise = getData()
    const newResult = await cacheData.pendingPromise
    cacheData = {
      fetchedAt: now(),
      result: newResult,
      pendingPromise: null,
    }
    return newResult
  }

  return {
    async get() {
      const { result, pendingPromise } = cacheData
      if (pendingPromise) return pendingPromise
      if (result === null || isExpired()) {
        return fillCache()
      }

      return result
    },
    getIfExists() {
      return cacheData.result
    },
    isValid,
    invalidate() {
      cacheData = emptyData
      fillCache()
    }
  }
}

const now = () => new Date().valueOf()
