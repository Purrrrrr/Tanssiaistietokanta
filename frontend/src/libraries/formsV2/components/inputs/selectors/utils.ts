import { useState } from 'react'

import type { Items, ItemToString } from './types'

export function acceptNulls<T>(
  itemToString: (item: T) => string,
  nullDefault: string = '',
): ((item: T | null) => string) {
  return item => item ? itemToString(item) : nullDefault
}

export function useItems<T>(getItems: Items<T>) {
  const [items, setItems] = useState<T[]>([])
  if (Array.isArray(getItems)) {
    return [
      getItems,
      async () => {},
    ] as const
  }


  const loadItems = async () => {
    setItems(await getItems(''))
  }

  return [items, loadItems] as const

}

export function useFilteredItems<T>(items: Items<T>, itemToString: ItemToString<T>) {
  const [filteredItems, setFilteredItems] = useState<T[]>([])
  const updateFilter = async (filter: string) => setFilteredItems(await getItems(items, filter, itemToString))

  return [
    filteredItems,
    updateFilter
  ] as const
}

export async function getItems<T>(items: Items<T>, filter: string, itemToString: ItemToString<T>): Promise<T[]> {
  if (Array.isArray(items)) {
    return filterItems(items, filter, itemToString)
  }

  return await items(filter)
}

export async function filterItems<T>(items: T[], filter: string, itemToString: ItemToString<T>): Promise<T[]> {
  return items.filter(item => itemToString(item).includes(filter))
}

export function preventDownshiftDefaultWhen<T>(condition: (event: T) => boolean) {
  return (e: T) => {
    if (condition(e)) preventDownshiftDefault(e)
  }
}

function preventDownshiftDefault<T>(event: T) {
  (event as unknown as Record<string, boolean>).preventDownshiftDefault = true
}
