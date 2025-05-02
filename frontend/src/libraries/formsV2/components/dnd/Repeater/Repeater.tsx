import { type ElementType, type ReactNode, useContext } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { AcceptedTypes, ID, ItemData, ItemTypeClassifier, ListItem } from '../types'
import type { AnyType, DataPath } from '../../../types'

import { useFormContext } from '../../../context'
import { useValueAt } from '../../../hooks'
import { ItemVisitContext } from '../context'
import { useIsDropAreaDisabled } from '../useIsDropAreaDisabled'
import { SortableItem } from './SortableItem'

export type RepeaterProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> = {
  dropAreaId: string
  path: DataPath<Value[], Data>
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
  itemType?: ItemTypeClassifier<Value, AcceptedTypeDefs>
  asElement?: ElementType<{children?: ReactNode}>
  children: (props: ChildCallbackProps<Value, Data>) => ReactNode
}

interface ChildCallbackProps<Value, Data> {
  dragHandle: ReactNode
  path: DataPath<Value[], Data>
  id: ID
  index: number
  value: Value
}

export function Repeater<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>({
  dropAreaId, path, children, itemType, accepts, asElement: Wrapper = 'div'
}: RepeaterProps<Value, Data, AcceptedTypeDefs>) {
  const { readOnly } = useFormContext<Data>()
  const values = useValueAt<Value[], Data>(path)
  const items = useItems(dropAreaId, path, values, itemType)

  const disabled = useIsDropAreaDisabled(dropAreaId, accepts)

  if (readOnly) {
    return <>
      {items.map((data) =>
        <Wrapper key={data.id}>
          {children?.({ dragHandle: null, ...data, path: data.path as DataPath<Value[], Data> })}
        </Wrapper>
      )}
    </>
  }

  return <SortableContext
    id={dropAreaId}
    items={items.map(item => item.id)}
    strategy={verticalListSortingStrategy}
    disabled={disabled}
  >
    {
      items.map((data) =>
        <SortableItem id={data.id} data={data} key={data.id} asElement={Wrapper} disabled={disabled}>
          {dragHandle => children?.({ dragHandle, ...data, path: data.path as DataPath<Value[], Data> })}
        </SortableItem>
      )
    }
  </SortableContext>
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
