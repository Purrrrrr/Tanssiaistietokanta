import { useSyncExternalStore } from 'react'

import { RightQuery, ServiceRightParams } from 'libraries/access-control/types'

import { getCurrentUser, subscribeToAuthChanges, type User } from 'backend/authentication'

import { backendQueryHook, entityListQueryHook, graphql, setupServiceUpdateFragment } from '../backend'

export { login, logout } from 'backend/authentication'

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuthChanges, getCurrentUser)
}
setupServiceUpdateFragment('users', `fragment UserFragment on User {
  _id, name, username, sessionId,
}`)

export const useUsers = entityListQueryHook('users', graphql(`
query getUsers {
  users {
    _id, name, username, sessionId, groups,
  }
}`))

export const useUser = backendQueryHook(graphql(`
query getUser($id: ID!) {
  user(id: $id) {
    _id, name, username, sessionId, groups,
  }
}`))

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
