import deepEquals from 'fast-deep-equal'

export function mapToIds(items: unknown[]): unknown[] {
  const ids = new Set()
  return items.map(item => {
    let id = getPossibleId(item)
    if (ids.has(id)) {
      id = { id }
    }
    ids.add(id)
    return id
  })
}

function getPossibleId(item: any): unknown {
  if (isPlainValue(item)) return item
  if ('_id' in item) {
    return item._id
  }
  if ('id' in item) {
    return item.id
  }
  return item
}

export function areEqualWithoutId(a: any, b: any) : boolean {
  if (isPlainValue(a) || isPlainValue(b)) return deepEquals(a, b)

  //Both are objects
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

function isPlainValue(item: unknown): boolean {
  return typeof item !== 'object' || item === null || item === undefined || Array.isArray(item)
}
