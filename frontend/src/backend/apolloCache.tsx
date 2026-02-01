import { modify } from 'partial.lenses'

import { Entity } from './types'

import createDebug from 'utils/debug'

import { apolloClient, DocumentNode } from './apollo'
import { getSingleKey } from './apolloUtils'

const debug = createDebug('apolloCache')

function getApolloCache() {
  return apolloClient.cache
}

export function appendToListQuery(query: DocumentNode, newValue: Entity, variables?: unknown) {
  debug('appending to query', newValue)
  getApolloCache().updateQuery({ query, variables }, data => {
    debug(data)
    const key = getSingleKey(data)
    debug(key)
    return modify(key, list => [...list, newValue], data)
  })
}

export function filterRemovedFromListQuery(query: DocumentNode, variables?: unknown) {
  getApolloCache().updateQuery({ query, variables }, data => {
    const key = getSingleKey(data)
    return modify(key, list => list.filter(isExistingEntity), data)
  })
}

export function updateEntityFragment(typeName: string, fragment: DocumentNode, data: Entity | { inaccessible: true }) {
  if ('inaccessible' in data) {
    // Entity rights have been changed so that the entity is not visible to the user
    return
  }
  const id = data._id
  if (!id) {
    throw new Error(`Missing id in updated value ${JSON.stringify(data)}`)
  }
  const cache = getApolloCache()
  debug('updating fragment', {
    id: cache.identify({ ...data, __typename: typeName }),
    data,
  })
  getApolloCache().writeFragment({
    id: cache.identify({ ...data, __typename: typeName }),
    fragment,
    data,
  })
}

const deletedIds = new Set()

export function isExistingEntity(entity: Entity) {
  return !deletedIds.has(entity._id)
}

export function markDeleted(entity: Entity) {
  deletedIds.add(entity._id)
}
