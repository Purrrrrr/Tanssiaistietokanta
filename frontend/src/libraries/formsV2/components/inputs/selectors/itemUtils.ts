import { useState } from 'react'

import type { InternalItemData, ItemCategory, Items, ItemToString, SelectorProps, SyncItems } from './types'

import { searchList } from 'libraries/common/listSearch'

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
    return searchList(items, filter, itemToString)
  }

  return {
    categories: items.categories
      .map(category => ({
        ...category,
        items: searchList(category.items, filter, itemToString),
      }))
      .filter(categoryHasItems),
  }
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
