import { useSyncExternalStore } from 'react'

import { RightQuery } from 'libraries/access-control/types'

import { getCurrentUser, subscribeToAuthChanges } from 'backend/authentication'

import { backendQueryHook, entityListQueryHook, graphql, setupServiceUpdateFragment } from '../backend'
import { clearAccessCache, hasAccess, hasCachedAccess } from './access'

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
  interface AccessControlServiceRights {
    dances: ['create', 'list', 'read', 'modify', 'delete']
    events: ['create', 'list', 'read', 'modify', 'delete', 'manage-access']
    workshops: ['create', 'list', 'read', 'modify', 'delete']
    files: ['create', 'list', 'read', 'modify', 'delete']
    volunteers: ['create', 'list', 'read', 'modify', 'delete']
    eventVolunteers: ['create', 'list', 'read', 'modify', 'delete']
  }
}

subscribeToAuthChanges(clearAccessCache)

export async function hasRight(query: RightQuery) {
  const { right, service, ...rest } = query
  return await hasAccess({ action: right, ...rest, service })
}
export function hasCachedRight(query: RightQuery) {
  const { right, service, ...rest } = query
  return hasCachedAccess({ action: right, ...rest, service })
}
