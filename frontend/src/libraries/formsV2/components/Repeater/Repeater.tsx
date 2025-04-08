import { type ReactNode, useContext, useId } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { DroppableData, ID, ItemData, ListItem } from './types'
import type { AnyType, DataPath } from '../../types'

import { useFormContext } from '../../context'
import { ItemVisitContext } from './context'
import { Droppable } from './Droppable'
import { SortableItem } from './SortableItem'

export type RepeaterProps<Value extends ListItem, Data = AnyType> = {
  children: (props: ChildCallbackProps<Value, Data>) => ReactNode
  path: DataPath<Value[], Data>
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

export function Repeater<Value extends ListItem, Data = AnyType>({path, children, table }: RepeaterProps<Value, Data>) {
  const { readOnly, getValueAt } = useFormContext<Data>()
  const values = getValueAt<Value[]>(path)
  const fieldId = useId()
  const items = useItems(fieldId, path, values)
  const ids = items.map(item => item.id)

  const Wrapper = table ? 'table' : 'div'
  const Item = table ? 'tr' : 'div'

  if (readOnly) {
    return <Wrapper>
      {
        items.map((data) =>
          <Item key={data.id}>
            {children?.({ dragHandle: null, path, id: data.id, index: data.index, value: data.value })}
          </Item>
        )
      }
    </Wrapper>
  }

  return <Droppable
    asElement={Wrapper}
    data={ { type: 'droppable', path, fieldId } satisfies DroppableData}
    disabled={values.length > 0}
  >
    <SortableContext id={fieldId} items={ids} strategy={verticalListSortingStrategy}>
      {
        items.map((data) =>
          <SortableItem id={data.id} data={data} key={data.id} asElement={Item}>
            {dragHandle =>
              children?.({ dragHandle, path, id: data.id, index: data.index, value: data.value })}
          </SortableItem>
        )
      }
    </SortableContext>
  </Droppable>
}

function useItems<T extends ListItem>(fieldId: string, path: string | number, values: T[]): ItemData<T>[] {
  const itemVisit = useContext(ItemVisitContext)
  const toItem = (value: T, index: number) => ({
    type: 'item',
    fieldId,
    id: getId(value),
    index, path, value,
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
