export function sorted<Item>(
  items: Item[],
  comparator: (a: Item, b: Item) => number,
) {
  return [...items].sort(comparator)
}

export function sortedBy<Item>(
  items: Item[],
  sortKey: (item: Item) => string | number | null | undefined,
) {
  return sorted(items, compareBy(sortKey))
}

export function compareBy<Item>(sortKey: (item: Item) => string | number | null | undefined): (a: Item, b: Item) => number {
  return (a, b) => {
    const keyA = sortKey(a)
    const keyB = sortKey(b)

    if (keyA == null) {
      return keyB == null ? 0 : -1
    }
    if (keyB == null) {
      return keyA == null ? 0 : 1
    }
    if (typeof keyA === 'string' && typeof keyB === 'string') return keyA.localeCompare(keyB)
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  }
}
