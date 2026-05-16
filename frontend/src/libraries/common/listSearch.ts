type ItemToString<Item> = StringKey<Item> | ((item: Item) => Searchable)
type StringKey<Item> = { [Key in keyof Item]: Item[Key] extends Searchable ? Key : never }[keyof Item]
type Searchable = string | number

export function searchList<T>(items: T[], rawFilter: string | null | undefined, ...itemToStrings: ItemToString<T>[]): T[] {
  if (rawFilter == null) return items
  const filter = rawFilter.trim().toLowerCase()
  if (filter === '') return items

  return items
    .map((item, index) => {
      let len = 0
      let indexOfFilter = -1
      for (const itemToString of itemToStrings) {
        const value = typeof itemToString === 'function'
          ? itemToString(item)
          : item[itemToString] as Searchable
        const str = value.toString()

        indexOfFilter = str.toLowerCase().indexOf(filter)
        if (indexOfFilter >= 0) break

        len += str.length
      }
      indexOfFilter = indexOfFilter >= 0 ? indexOfFilter + len : -1

      return {
        item, indexOfFilter, index,
      }
    })
    .filter(hit => hit.indexOfFilter >= 0)
    .sort((a, b) => {
      if (a.indexOfFilter > b.indexOfFilter) return 1
      if (b.indexOfFilter < a.indexOfFilter) return -1

      return a.index - b.index
    })
    .map(hit => hit.item)
}

export function canCreateUniqueItemFromQuery<T>(items: T[], rawFilter: string | null | undefined, itemToString: ItemToString<T>): boolean {
  if (rawFilter == null) return false
  const filter = rawFilter.trim().toLowerCase()
  if (filter === '') return false

  return !items.some(item => {
    const value = typeof itemToString === 'function'
      ? itemToString(item)
      : item[itemToString] as Searchable
    return value.toString().toLowerCase() === filter
  })
}
