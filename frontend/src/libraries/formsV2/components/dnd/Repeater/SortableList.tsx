import { type ReactNode } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { ID, ItemData, ListItem } from './types'
import type { AnyType, DataPath } from '../../../types'

import { useFormContext } from '../../../context'
import { SortableItem, SortableItemElement } from './SortableItem'

export interface SortableListProps<Value extends ListItem, Data = AnyType> {
  disabled?: boolean
  dropAreaId: string
  items: ItemData<Value>[]
  asElement?: SortableItemElement
  children: ItemCallback<Value, Data>
}

export type ItemCallback<Value, Data> = (props: ItemCallbackProps<Value, Data>) => ReactNode

export interface ItemCallbackProps<Value, Data> {
  dragHandle: ReactNode
  onRemove: () => void
  path: DataPath<Value[], Data>
  id: ID
  index: number
  value: Value
}

export function SortableList<Value extends ListItem, Data = AnyType>({
  disabled, dropAreaId, items, children, asElement: Wrapper = 'div',
}: SortableListProps<Value, Data>) {
  const { readOnly, dispatch } = useFormContext<Data>()

  if (readOnly) {
    return <>
      {items.map((data) =>
        <Wrapper key={data.id}>
          {children?.({ dragHandle: null, ...data, path: data.path as DataPath<Value[], Data>, onRemove: noOp })}
        </Wrapper>,
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
          {dragHandle => children?.({
            dragHandle,
            ...data,
            path: data.path as DataPath<Value[], Data>,
            onRemove: () => dispatch({ type: 'REMOVE_ITEM', path: data.path, index: data.index }),
          })}
        </SortableItem>,
      )
    }
  </SortableContext>
}

const noOp = () => {}
