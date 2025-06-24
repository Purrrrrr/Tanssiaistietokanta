import { useState } from 'react'

import type { InternalItemData, Items, ItemToString, SyncItems } from './types'

const emptyResult : InternalItemData<unknown> = {
  showCategories: false,
  categories: [],
  items: []
}

export function useItems<T>(items: Items<T>) {
  const [itemData, setItems] = useState<InternalItemData<T>>(emptyResult as InternalItemData<T>)
  if (typeof items === 'function') {
    const loadItems = async () => {
      setItems(toItemData(await items('')))
    }

    return [itemData, loadItems] as const
  }

  return [
    toItemData(items),
    async () => {},
  ] as const
}

export function useFilteredItems<T>(items: Items<T>, itemToString: ItemToString<T>) {
  const [filteredItems, setFilteredItems] = useState(emptyResult as InternalItemData<T>)
  const updateFilter = async (filter: string) => {
    const newItems = toItemData(await getItems(items, filter, itemToString))
    setFilteredItems(newItems)
    return newItems
  }

  return [
    filteredItems,
    updateFilter
  ] as const
}

async function getItems<T>(items: Items<T>, filter: string, itemToString: ItemToString<T>): Promise<SyncItems<T>> {
  if (typeof items === 'function') {
    return await items(filter)
  }
  if (Array.isArray(items)) {
    return filterItemList(items, filter, itemToString)

  }

  return {
    categories: items.categories
      .map(category => ({
        ...category,
        items: filterItemList(category.items, filter, itemToString)
      }))
      .filter(category => category.items.length > 0)
  }
}

export function filterItemList<T>(items: T[], rawFilter: string, itemToString: ItemToString<T>): T[] {
  const filter = rawFilter.trim().toLowerCase()
  return items
    .map((item, index) => {
      const indexOfFilter = itemToString(item).toLowerCase().indexOf(filter)

      return {
        item, indexOfFilter, index
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

function toItemData<T>(items: SyncItems<T>): InternalItemData<T> {
  if (Array.isArray(items)) {
    return {
      showCategories: false,
      items,
      categories: [ { items, title: '' }]
    }
  }

  return {
    showCategories: true,
    categories: items.categories,
    items: items.categories.flatMap(category => category.items),
  }
}
