import { useSyncExternalStore } from 'react'

import { ID, ServiceName } from 'backend/types'

import { getCurrentUser, subscribeToAuthChanges, type User } from 'backend/authentication'

export { login, logout } from 'backend/authentication'

export const rights = ['create', 'delete', 'manage', 'read', 'update'] as const
export type Rights = [...typeof rights]
export type Right = Rights[number]
export type Scope = ServiceName
export interface RightQuery {
  right: Right
  service: Scope
  entity?: ID
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
}

function hasRight(user: User | null, { right, service }: RightQuery) {
  if (right === 'read' && service !== 'files') {
    return true
  }
  return user !== null
}

export function useHasRight(query: RightQuery) {
  const user = useCurrentUser()
  return hasRight(user, query)
}

export function useHasRights(queries: RightQuery[]) {
  const user = useCurrentUser()
  return queries.map(query => hasRight(user, query))
}

// Legacy code bridge. TODO: remove eventually
export function useIsAdmin() {
  return useHasRight({ service: 'dances', right: 'manage' })
}

// Legacy code bridge. TODO: remove eventually
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isAdmin = useIsAdmin()
  return isAdmin ? children : (fallback ?? null)
}
