import deepEquals from 'fast-deep-equal'

import { Entity, ID, Mergeable } from './types'

export function mapToIds(items: Entity[]): ID[] {
  return items.map(getId)
}

export function getId(item: Entity): ID {
  if (typeof item === 'string' || typeof item === 'number') {
    return item
  }
  if ('_id' in item) {
    return item._id
  }
  throw new Error('No object id found')
}

export function areEqualWithoutId(a: Mergeable, b: Mergeable): boolean {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return deepEquals(a, b)

  // Both are objects
  for (const key of Object.keys(a)) {
    if (!(key in b)) return false
    if (key === 'id' || key === '_id') continue

    if (!areEqualWithoutId(a[key], b[key])) return false
  }
  for (const key of Object.keys(b)) {
    if (!(key in a)) return false
  }
  return true
}
