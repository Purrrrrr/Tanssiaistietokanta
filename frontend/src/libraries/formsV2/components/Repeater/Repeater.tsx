import { type ReactNode, useContext, useId } from 'react'
import { useDndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { AcceptedTypes, DroppableData, ID, ItemData, ItemTypeClassifier, ListItem } from './types'
import type { AnyType, DataPath } from '../../types'

import { useFormContext } from '../../context'
import { useValueAt } from '../../hooks'
import { ItemVisitContext } from './context'
import { Droppable } from './Droppable'
import { SortableItem } from './SortableItem'

export type RepeaterProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> = {
  children: (props: ChildCallbackProps<Value, Data>) => ReactNode
  path: DataPath<Value[], Data>
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
  itemType?: ItemTypeClassifier<Value, AcceptedTypeDefs>
  table?: boolean
}

interface ChildCallbackProps<Value, Data> {
  dragHandle: ReactNode
  path: DataPath<Value[], Data>
  id: ID
  index: number
  value: Value
}

const getId = (value: ListItem) => typeof value === 'object'
  ? value._id : value

export function Repeater<Value extends ListItem, Data = AnyType>({path, children, table, itemType, accepts }: RepeaterProps<Value, Data>) {
  const { readOnly } = useFormContext<Data>()
  const { active } = useDndContext()
  const values = useValueAt<Value[], Data>(path)
  const fieldId = useId()
  const items = useItems(fieldId, path, values, itemType)
  const ids = items.map(item => item.id)

  const Wrapper = table ? 'table' : 'div'
  const Item = table ? 'tr' : 'div'

  if (readOnly) {
    return <Wrapper>
      {items.map((data) =>
        <Item key={data.id}>
          {children?.({ dragHandle: null, ...data, path: data.path as DataPath<Value[], Data> })}
        </Item>
      )}
    </Wrapper>
  }

  const activeItemData = active?.data.current as ItemData | undefined
  const activeIsFromOtherRepeatable = activeItemData != null && activeItemData.fieldId !== fieldId
  const disabled = activeIsFromOtherRepeatable && !isDropAccepted(activeItemData?.itemType, accepts)

  return <Droppable
    asElement={Wrapper}
    data={ { type: 'droppable', path, fieldId } satisfies DroppableData}
    disabled={values.length > 0 || disabled}
  >
    <SortableContext id={fieldId} items={ids} strategy={verticalListSortingStrategy} disabled={disabled}>
      {
        items.map((data) =>
          <SortableItem id={data.id} data={data} key={data.id} asElement={Item} disabled={disabled}>
            {dragHandle => children?.({ dragHandle, ...data, path: data.path as DataPath<Value[], Data> })}
          </SortableItem>
        )
      }
    </SortableContext>
  </Droppable>
}

function useItems<T extends ListItem>(
  fieldId: string, path: string | number, values: T[], itemType?: string | ((val: T) => [string, T])
): ItemData<T>[] {
  const itemVisit = useContext(ItemVisitContext)
  const toItem = (value: T, index: number) => ({
    type: 'item',
    fieldId,
    id: getId(value),
    index, path, value,
    itemType: typeof itemType === 'function' ? itemType(value)?.[0] : itemType,
  } satisfies ItemData<T>)
  const items = values.map(toItem)

  if (itemVisit) {
    if (itemVisit.to.fieldId === fieldId) {
      return [
        ...items,
        itemVisit.item as ItemData<T>,
      ]
    }
    if (itemVisit.item.fieldId === fieldId) {
      const ghostIndex = itemVisit.item.index
      return items.map((item, index) => index === ghostIndex ? asGhost(item) : item)
    }
  }
  return items
}

function asGhost<T>(item: ItemData<T>): ItemData<T> {
  return {
    ...item,
    ghost: true,
    id: `${item.id}-ghost`
  }
}

function isDropAccepted<T>(itemType: T, accepted?: T | T[]): boolean {
  if (Array.isArray(accepted)) {
    return accepted.includes(itemType)
  }

  return accepted !== undefined && accepted === itemType
}
