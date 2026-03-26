import EventEmitter from 'events'

import { type Access, AccessAllowed, type AccessQuery, ServiceName } from 'types/gql/graphql'

import { socketRequest } from 'backend'
import { socket } from 'backend/connection'

import createDebug from 'utils/debug'

const debug = createDebug('access')

const globalAccess = {
  cache: new Map<`${ServiceName}:${string}`, AccessAllowed>(),
  promise: null as Promise<void> | null,
}
let accessCache: Access[] = []
const eventEmitter = new EventEmitter()
eventEmitter.setMaxListeners(100)

export function subscribeToAccessUpdates(callback: () => unknown) {
  eventEmitter.on('update', callback)
  return () => eventEmitter.off('update', callback)
}

export function clearAccessCache() {
  globalAccess.cache.clear()
  globalAccess.promise = null
  accessCache.length = 0
  eventEmitter.emit('update')
  debug('Cleared access cache')
}

socket.on('access updated', (updatedAccess: { service: ServiceName, id: string }) => {
  debug('Received access updated event: %O', updatedAccess)
  const before = accessCache.length
  accessCache = accessCache.filter(access => !affectsAccess(access, updatedAccess))
  eventEmitter.emit('update')
  debug(`Removed ${before - accessCache.length} accesses from cache due to access update`)
})

function affectsAccess(access: Access, updatedAccess: { service: ServiceName, id: string }): boolean {
  if (access.owner === updatedAccess.service && access.owningId === updatedAccess.id) {
    return true
  }
  if (access.service === updatedAccess.service && access.entityId === updatedAccess.id) {
    return true
  }
  return false
}

interface SpecificAccessQuery extends AccessQuery {
  service: ServiceName
  action: string
}

export async function hasAccess(query: SpecificAccessQuery): Promise<boolean> {
  const access = await checkAccess(query)
  if (access === AccessAllowed.Unknown) {
    console.warn(
      'Access for query %O is unknown, defaulting to deny',
      // Try to filter out undefined values from the query for better logging
      Object.fromEntries(Object.entries(query).filter(([_, value]) => value !== undefined)),
    )
  }
  return access === AccessAllowed.Grant
}

export function hasCachedAccess(query: SpecificAccessQuery): boolean | undefined {
  const access = checkCachedAccess(query)
  if (access === AccessAllowed.Unknown) {
    return undefined
  }
  return access === AccessAllowed.Grant
}

async function checkAccess(query: SpecificAccessQuery): Promise<AccessAllowed> {
  if (globalAccess.cache.size === 0) {
    await fetchGlobalAccesses()
  }
  const cachedAccess = checkCachedAccess(query)
  if (cachedAccess !== AccessAllowed.Unknown) {
    return cachedAccess
  }

  const accesses = await fetchAccess(query)
  const matchingAccess = accesses.find(access => hasEqualAccessQuery(access, query))
  return matchingAccess ? matchingAccess.allowed : AccessAllowed.Deny
}

function checkCachedAccess(query: SpecificAccessQuery): AccessAllowed {
  const globalResult = checkGlobalAccess(query)
  if (globalResult !== AccessAllowed.Unknown) {
    return globalResult
  }

  const cachedAccess = accessCache.find(access => hasEqualAccessQuery(access, query))
  return cachedAccess ? cachedAccess.allowed : AccessAllowed.Unknown
}

function checkGlobalAccess(query: SpecificAccessQuery): AccessAllowed {
  const key = `${query.service}:${query.action}` as const
  return globalAccess.cache.get(key) ?? AccessAllowed.Unknown
}

async function fetchGlobalAccesses(): Promise<void> {
  if (globalAccess.promise) {
    return globalAccess.promise
  }
  const { promise, resolve } = Promise.withResolvers<undefined>()
  globalAccess.promise = promise
  const accesses = await socketRequest<Access[]>('access', 'find', { })
  resolve(undefined)
  debug('Fetched global accesses: %t', accesses)

  globalAccess.cache.clear()
  accesses.forEach(access => {
    const key = `${access.service}:${access.action}` as `${ServiceName}:${string}`
    globalAccess.cache.set(key, access.allowed)
  })
}

interface FetchQueue {
  queries: AccessQuery[]
  promise?: PromiseWithResolvers<Access[]>
}

let queue: FetchQueue | null = null

async function fetchAccess(query: AccessQuery): Promise<Access[]> {
  queue ??= { queries: [] }
  const currentQueue = queue
  if (!currentQueue.promise) {
    const promise = Promise.withResolvers<Access[]>()
    currentQueue.promise = promise
    window.setTimeout(() => {
      doFetchAccess(currentQueue.queries).then(promise.resolve).catch(promise.reject)
      queue = null
    }, 0)
  }
  queue.queries.push(query)

  return currentQueue.promise.promise
}

async function doFetchAccess(queries: AccessQuery[]): Promise<Access[]> {
  const accesses = await socketRequest<Access[]>('access', 'find', { queries })
  debug('Fetched accesses for queries %o:\n%t', queries, accesses)
  if (accesses === null) {
    console.warn('Received null accesses for queries %o, treating as empty array', queries)
    return []
  }
  updateAccessCache(accesses)
  return accesses
}

function updateAccessCache(accesses: Access[]) {
  accesses?.forEach(access => {
    const existingIndex = accessCache.findIndex(a => hasEqualAccessQuery(a, access))
    if (existingIndex !== -1) {
      accessCache[existingIndex] = access
    } else {
      accessCache.push(access)
    }
  })
}

const accessEqualityKeys: (keyof Access | keyof AccessQuery)[] = ['service', 'action', 'entityId', 'owner', 'owningId']
function hasEqualAccessQuery(access1: Access | AccessQuery, access2: Access | AccessQuery): boolean {
  return accessEqualityKeys.every(key => access1[key] === access2[key])
}
