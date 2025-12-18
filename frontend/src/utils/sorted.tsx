export function sorted<Item>(
  items: Item[],
  comparator: (a: Item, b: Item) => number,
) {
  return [...items].sort(comparator)
}

export function sortedBy<Item>(
  items: Item[],
  sortKey: (item: Item) => string | number | null | undefined,
  descending = false,
  nullsLast = true,
) {
  return sorted(items, compareBy(sortKey, descending, nullsLast))
}

export function compareBy<Item>(sortKey: (item: Item) => string | number | null | undefined, descending = false, nullsLast = true): (a: Item, b: Item) => number {
  if (descending) {
    const ascComparator = compareBy(sortKey, false)
    return (a, b) => -ascComparator(a, b)
  }
  return (a, b) => {
    const keyA = sortKey(a)
    const keyB = sortKey(b)

    if (keyA == null && keyB == null) {
      return 0
    }
    if (keyA == null) {
      return nullsLast ? 1 : -1
    }
    if (keyB == null) {
      return nullsLast ? -1 : 1
    }
    if (typeof keyA === 'string' && typeof keyB === 'string') return keyA.localeCompare(keyB)
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  }
}
