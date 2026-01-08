import { useSyncExternalStore } from 'react'

import { RightQuery, ServiceRightParams } from 'libraries/access-control/types'

import { getCurrentUser, subscribeToAuthChanges, type User } from 'backend/authentication'

export { login, logout } from 'backend/authentication'

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
}

declare global {
  interface AccessControlServiceRegistry {
    dances: ServiceRightParams<['create', 'read', 'modify', 'delete']>
    events: ServiceRightParams<['create', 'read', 'modify', 'delete']>
    workshops: ServiceRightParams<['create', 'read', 'modify', 'delete']>
    files: ServiceRightParams<['create', 'read', 'modify', 'delete']>
  }
}

export function hasRight(user: User | null, { right, service }: RightQuery) {
  if (right === 'read' && service !== 'files') {
    return true
  }
  return user !== null
}
