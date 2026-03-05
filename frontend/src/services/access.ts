import { type Access, AccessAllowed, type AccessQuery, AccessTarget, ServiceName } from 'types/gql/graphql'

import { socketRequest } from 'backend'

import createDebug from 'utils/debug'

const debug = createDebug('access')

const globalAccess = new Map<`${ServiceName}:${string}`, AccessAllowed>()
const accessCache: Access[] = []

interface SpecificAccessQuery extends AccessQuery {
  service: ServiceName
  action: string
}

export async function hasAccess(query: SpecificAccessQuery): Promise<boolean> {
  const access = await checkAccess(query)
  if (access === AccessAllowed.Unknown) {
    debug('Access for query %O is unknown, defaulting to deny', query)
  }
  return access === AccessAllowed.Grant
}

async function checkAccess(query: SpecificAccessQuery): Promise<AccessAllowed> {
  const globalResult = await checkGlobalAccess(query)
  if (globalResult !== AccessAllowed.Unknown) {
    return globalResult
  }

  const cachedAccess = accessCache.find(access => hasEqualAccessQuery(access, query))
  if (cachedAccess) {
    return cachedAccess.allowed
  }
  const accesses = await fetchAccess(query)
  const matchingAccess = accesses.find(access => hasEqualAccessQuery(access, query))
  return matchingAccess ? matchingAccess.allowed : AccessAllowed.Deny
}

async function checkGlobalAccess(query: SpecificAccessQuery): Promise<AccessAllowed> {
  if (globalAccess.size === 0) {
    await fetchGlobalAccesses()
  }
  const key = `${query.service}:${query.action}` as const
  return globalAccess.get(key) ?? AccessAllowed.Unknown
}

async function fetchGlobalAccesses(): Promise<void> {
  const accesses = await socketRequest<Access[]>('access', 'find', { })
  debug('Fetched global accesses: %t', accesses)

  globalAccess.clear()
  accesses.forEach(access => {
    const key = `${access.service}:${access.action}` as `${ServiceName}:${string}`
    globalAccess.set(key, access.allowed)
  })
}

async function fetchAccess(query: AccessQuery): Promise<Access[]> {
  const accesses = await socketRequest<Access[]>('access', 'find', query)
  debug('Fetched accesses for query %o:\n%t', query, accesses)
  updateAccessCache(accesses)
  return accesses
}

function updateAccessCache(accesses: Access[]) {
  accesses.forEach(access => {
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
