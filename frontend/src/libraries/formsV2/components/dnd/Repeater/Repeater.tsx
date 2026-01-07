import { useContext, useId } from 'react'

import { AcceptedTypes, ItemData, ItemTypeClassifier, ListItem } from './types'
import type { AnyType, DataPath } from '../../../types'

import { useValueAt } from '../../../hooks/externalHookApi'
import { ItemVisitContext } from '../context'
import { DropArea } from './DropArea'
import { ItemCallback, SortableList } from './SortableList'
import { useIsDropAreaDisabled } from './useIsDropAreaDisabled'

export interface RepeaterProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> {
  path: DataPath<Value[], Data>
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
  itemType?: ItemTypeClassifier<Value, AcceptedTypeDefs>
  itemClassName?: string
  children: ItemCallback<Value, Data>
  className?: string
}

export function Repeater<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>({
  path, accepts, itemType, itemClassName, children, className,
}: RepeaterProps<Value, Data, AcceptedTypeDefs>) {
  const dropAreaId = useId()
  const values = useValueAt<Value[], Data>(path)
  const items = useItems(dropAreaId, path, values, itemType)
  const disabled = useIsDropAreaDisabled(dropAreaId, accepts)

  return <DropArea id={dropAreaId} path={path} className={className}>
    <SortableList items={items} disabled={disabled} dropAreaId={dropAreaId} itemClassName={itemClassName}>
      {children}
    </SortableList>
  </DropArea>
}

function useItems<T extends ListItem, TypeDefs>(
  dropAreaId: string, path: string | number, values: T[], itemType?: ItemTypeClassifier<T, TypeDefs>,
): ItemData<T>[] {
  const itemVisit = useContext(ItemVisitContext)
  const toItem = (value: T, index: number) => ({
    type: 'item',
    dropAreaId,
    id: `${dropAreaId}-${getId(value)}`,
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
    id: `${item.id}-ghost`,
  }
}
