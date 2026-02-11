import { useState } from 'react'

import type { InternalItemData, ItemCategory, Items, ItemToString, SelectorProps, SyncItems } from './types'

const emptyResult: InternalItemData<unknown> = {
  showCategories: false,
  categories: [],
  items: [],
}

type ItemProps<T> = Pick<SelectorProps<T>, 'items' | 'itemHidden' | 'itemToString'>

export function useItems<T>({ items, itemHidden }: ItemProps<T>) {
  const [itemData, setItems] = useState<InternalItemData<T>>(emptyResult as InternalItemData<T>)
  if (typeof items === 'function') {
    const loadItems = async () => {
      setItems(toItemData(await items(''), itemHidden))
    }

    return [itemData, loadItems] as const
  }

  return [
    toItemData(items),
    async () => { /* nop */ },
  ] as const
}

export function useFilteredItems<T>({ items, itemToString = String, itemHidden }: ItemProps<T>) {
  const [filteredItems, setFilteredItems] = useState(emptyResult as InternalItemData<T>)
  const updateFilter = async (filter: string) => {
    const newItems = toItemData(await getItems(items, filter, itemToString), itemHidden)
    setFilteredItems(newItems)
    return newItems
  }

  return [
    filteredItems,
    updateFilter,
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
        items: filterItemList(category.items, filter, itemToString),
      }))
      .filter(categoryHasItems),
  }
}

export function filterItemList<T>(items: T[], rawFilter: string, itemToString: ItemToString<T>): T[] {
  const filter = rawFilter.trim().toLowerCase()
  return items
    .map((item, index) => {
      const indexOfFilter = itemToString(item).toLowerCase().indexOf(filter)

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

function toItemData<T>(rawItems: SyncItems<T>, itemHidden?: (item: T) => boolean): InternalItemData<T> {
  if (Array.isArray(rawItems)) {
    const items = hideItems(rawItems, itemHidden)
    return {
      showCategories: false,
      items,
      categories: [{ items, title: '' }],
    }
  }

  const categories = itemHidden
    ? rawItems.categories.map(category => ({
      ...category,
      items: hideItems(category.items, itemHidden),
    }))
    : rawItems.categories

  return {
    showCategories: true,
    categories: categories.filter(categoryHasItems),
    items: categories.flatMap(category => category.items),
  }
}

function hideItems<T>(items: T[], itemHidden?: (item: T) => boolean): T[] {
  return itemHidden
    ? items.filter(item => !itemHidden(item))
    : items
}

const categoryHasItems = <T>(category: ItemCategory<T>) => category.items.length > 0
