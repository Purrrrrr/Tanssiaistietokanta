import { useSyncExternalStore } from 'react'

import { Right, RightQuery, RightQueryInput, RightsEntity, RightsList, ServiceName } from './types'

import { getCurrentUser, subscribeToAuthChanges, type User } from 'backend/authentication'

export type { RightQueryInput, RightsEntity } from './types'
export { login, logout } from 'backend/authentication'

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
}

function hasRight(user: User | null, { right, service }: RightQuery) {
  if (right === 'read' && service !== 'files') {
    return true
  }
  return user !== null
}

export function useHasRight(query?: RightQueryInput, entity?: RightsEntity) {
  const user = useCurrentUser()
  if (query === undefined) return true
  return parseRightQuery(query, entity).every(q => hasRight(user, q))
}

export function useHasRights(queries: RightQueryInput, entity?: RightsEntity) {
  const user = useCurrentUser()
  return parseRightQuery(queries, entity).map(query => hasRight(user, query))
}

export function parseRightQuery(query: RightQueryInput, entity?: RightsEntity): RightQuery[] {
  if (Array.isArray(query)) {
    return query.flatMap((q: RightQueryInput) => parseRightQuery(q, entity))
  }
  if (typeof query !== 'string') {
    return [{
      ...query,
      entity: query.entity ?? entity,
    }]
  }

  const [service, rightsPart] = query.split(':') as [ServiceName, RightsList]
  const rights = rightsPart.split(',') as Right[]
  return rights.map(right => ({ service, entity, right }))
}
