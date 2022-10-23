import { modify } from 'partial.lenses'

import createDebug from 'utils/debug'

import {Entity} from './types'

import {apolloClient, DocumentNode} from './apollo'
import {getSingleKey} from './apolloUtils'

const debug = createDebug('apolloCache')

export function getApolloCache() {
  return apolloClient.cache
}

export function appendToListQuery(query : DocumentNode, newValue : Entity) {
  debug('appending to query', newValue)
  getApolloCache().updateQuery({query}, data => {
    const key = getSingleKey(data)
    debug(key)
    debug(data)
    return modify(key, list => [...list, newValue], data)
  })
}

export function filterRemovedFromListQuery(query : DocumentNode) {
  getApolloCache().updateQuery({query}, data => {
    const key = getSingleKey(data)
    return modify(key, list => list.filter(isExistingEntity), data)
  })
}

export function updateEntityFragment(typeName : string, fragment : DocumentNode, data : Entity) {
  const id = data._id
  if (!id) {
    throw new Error(`Missing id in updated value ${JSON.stringify(data)}`)
  }

  getApolloCache().writeFragment({
    id: `${typeName}:${id}`,
    fragment,
    data,
  })
}

const deletedIds = new Set()

export function isExistingEntity(entity : Entity) {
  return !deletedIds.has(entity._id)
}

export function markDeleted(entity : Entity) {
  deletedIds.add(entity._id)
}

