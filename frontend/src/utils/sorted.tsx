export function sorted<Item>(
  items: Item[],
  comparator: (a: Item, b: Item) => number,
) {
  return [...items].sort(comparator)
}

type SortKey<Item> = keyof Item | ((item: Item) => unknown)
type SortDirection = 'asc' | 'desc'
type Sort<Item> = SortKey<Item> | { key: SortKey<Item>, direction: SortDirection, nullsLast?: boolean }

export function sortedBy<Item>(
  items: Item[] | null | undefined,
  ...sorts: Sort<Item>[]
) {
  return sorted(items ?? [], compositeComparator(...sorts))
}

function compositeComparator<Item>(
  ...sorts: Sort<Item>[]
): (a: Item, b: Item) => number {
  const comparators = sorts.map(sort => {
    if (typeof sort === 'function' || typeof sort !== 'object') {
      return compareBy(sort)
    }
    const { key, direction, nullsLast } = sort
    return compareBy(key, direction, nullsLast !== false)
  })
  if (comparators.length === 1) {
    return comparators[0]
  }

  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b)
      if (result !== 0) {
        return result
      }
    }
    return 0
  }
}

export function compareBy<Item>(
  sortKey: SortKey<Item>,
  direction: SortDirection = 'asc',
  nullsLast = true,
): (a: Item, b: Item) => number {
  if (typeof sortKey !== 'function') {
    return compareBy((item: Item) => item[sortKey], direction, nullsLast)
  }
  if (direction === 'desc') {
    const ascComparator = compareBy(sortKey)
    return (a, b) => -ascComparator(a, b)
  }
  return (a, b) => {
    const keyA = sortKey(a)
    const keyB = sortKey(b)

    return compareValues(keyA, keyB, nullsLast)
  }
}

function compareValues(a: unknown, b: unknown, nullsLast: boolean): number {
  if (a == null && b == null) {
    return 0
  }
  if (a == null) {
    return nullsLast ? 1 : -1
  }
  if (b == null) {
    return nullsLast ? -1 : 1
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const length = Math.min(a.length, b.length)
    for (let i = 0; i < length; i++) {
      const result = compareValues(a[i], b[i], nullsLast)
      if (result !== 0) {
        return result
      }
    }
    return a.length - b.length
  }
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
