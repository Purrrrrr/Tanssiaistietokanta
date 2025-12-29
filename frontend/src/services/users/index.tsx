import { useSyncExternalStore } from 'react'

import { ID, ServiceName } from 'backend/types'

import { getCurrentUser, subscribeToAuthChanges, type User } from 'backend/authentication'

import { JoinedList } from './typeUtils'

export { login, logout } from 'backend/authentication'

export const rights = ['create', 'delete', 'manage', 'read', 'modify'] as const
export type Rights = [...typeof rights]
export type Right = Rights[number]
export type Scope = ServiceName
export interface RightQuery {
  right: Right
  service: Scope
  entity?: ID
}

export type RightQueryString = `${ServiceName}${`/${ID}` | ''}:${RightsList}`
export type RightsList = JoinedList<Rights, ',', 3>

export const r: RightQueryString = 'files/adad:manage,create'

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
}

function hasRight(user: User | null, { right, service }: RightQuery) {
  if (right === 'read' && service !== 'files') {
    return true
  }
  return user !== null
}

export function useHasRight(query?: RightQueryInput, entityId?: ID) {
  const user = useCurrentUser()
  if (query === undefined) return true
  return parseRightQuery(query, entityId).every(q => hasRight(user, q))
}

export function useHasRights(queries: RightQueryInput, entityId?: ID) {
  const user = useCurrentUser()
  return parseRightQuery(queries, entityId).map(query => hasRight(user, query))
}

export type RightQueryInput = RightQueryString | RightQueryString[] | RightQuery | RightQuery[]

export function parseRightQuery(query: RightQueryInput, optionalId?: ID): RightQuery[] {
  if (Array.isArray(query)) {
    return query.flatMap(q => parseRightQuery(q, optionalId))
  }
  if (typeof query !== 'string') {
    return [{ ...query, entity: optionalId ?? query.entity }]
  }
  const [servicePart, rightsPart] = query.split(':')
  const [service, entity] = servicePart.split('/')
  const rights = rightsPart.split(',') as Right[]
  return rights.map(right => ({ service: service as ServiceName, entity: optionalId ?? entity ?? undefined, right }))
}
