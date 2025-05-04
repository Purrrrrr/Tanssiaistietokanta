import { useContext, useId } from 'react'

import { AcceptedTypes, ItemData, ItemTypeClassifier, ListItem } from './types'
import type { AnyType, DataPath } from '../../../types'

import { useValueAt } from '../../../hooks'
import { ItemVisitContext } from '../context'
import { type DroppableElement, DropArea } from './DropArea'
import { SortableItemElement } from './SortableItem'
import { ItemCallback, SortableList } from './SortableList'
import { useIsDropAreaDisabled } from './useIsDropAreaDisabled'

export interface RepeatingSectionProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> {
  path: DataPath<Value[], Data>
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
  itemType?: ItemTypeClassifier<Value, AcceptedTypeDefs>
  asElement?: DroppableElement
  itemElement?: SortableItemElement
  children: ItemCallback<Value, Data>
}

export function RepeatingSection<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>({
  path, accepts, itemType, asElement, itemElement, children
}: RepeatingSectionProps<Value, Data, AcceptedTypeDefs>) {
  const dropAreaId = useId()
  const values = useValueAt<Value[], Data>(path)
  const items = useItems(dropAreaId, path, values, itemType)
  const disabled = useIsDropAreaDisabled(dropAreaId, accepts)

  return <DropArea id={dropAreaId} path={path} asElement={asElement}>
    <SortableList items={items} disabled={disabled} dropAreaId={dropAreaId} asElement={itemElement}>
      {children}
    </SortableList>
  </DropArea>
}

function useItems<T extends ListItem, TypeDefs>(
  dropAreaId: string, path: string | number, values: T[], itemType?: ItemTypeClassifier<T, TypeDefs>
): ItemData<T>[] {
  const itemVisit = useContext(ItemVisitContext)
  const toItem = (value: T, index: number) => ({
    type: 'item',
    dropAreaId,
    id: getId(value),
    index, path, value,
    itemType: typeof itemType === 'function' ? itemType(value)?.[0] : itemType,
  } satisfies ItemData<T>)
  const items = values.map(toItem)

  if (itemVisit) {
    if (itemVisit.to.dropAreaId === dropAreaId) {
      return [
        ...items,
        itemVisit.item as ItemData<T>,
      ]
    }
    if (itemVisit.item.dropAreaId === dropAreaId) {
      const ghostIndex = itemVisit.item.index
      return items.map((item, index) => index === ghostIndex ? asGhost(item) : item)
    }
  }
  return items
}

const getId = (value: ListItem) => typeof value === 'object'
  ? value._id : value

function asGhost<T>(item: ItemData<T>): ItemData<T> {
  return {
    ...item,
    ghost: true,
    id: `${item.id}-ghost`
  }
}
