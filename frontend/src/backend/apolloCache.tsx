import { modify } from 'partial.lenses';
import {apolloClient, DocumentNode} from './apollo';
import {getSingleKey} from './apolloUtils'
import {Entity} from './types'

export function getApolloCache() {
  return apolloClient.cache
}

export function appendToListQuery(query : DocumentNode, newValue : Entity) {
  console.log(newValue)
  getApolloCache().updateQuery({query}, data => {
    const key = getSingleKey(data)
    console.log(key)
    console.log(data)
    return modify(key, list => [...list, newValue], data)
  });
}

export function filterRemovedFromListQuery(query : DocumentNode) {
  getApolloCache().updateQuery({query}, data => {
    const key = getSingleKey(data)
    return modify(key, list => list.filter(isExistingEntity), data)
  });
}

export function updateEntityFragment(typeName : string, fragment : DocumentNode, data : Entity) {
  const id = data._id
  if (!id) {
    console.error("Missing id in updated value", data)
    return
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

