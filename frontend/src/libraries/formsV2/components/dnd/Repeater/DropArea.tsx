import { useId } from 'react'
import { useDroppable } from '@dnd-kit/core'

import { DroppableData, ListItem } from './types'
import type { AnyType, DataPath } from '../../../types'

export interface DroppableProps<Value extends ListItem, Data = AnyType> {
  id: string
  className?: string
  path: DataPath<Value[], Data>
  children?: React.ReactNode
  disabled?: boolean
}

export function DropArea<Value extends ListItem, Data = AnyType>({
  id, path, children, disabled,
}: DroppableProps<Value, Data>) {
  const data = {
    type: 'droppable',
    path,
    dropAreaId: id,
  } satisfies DroppableData
  const { setNodeRef } = useDroppable({
    disabled: disabled,
    id: useId(),
    data,
  })
  const style = {
    minHeight: 30,
  }

  return <div ref={setNodeRef} style={style}>
    {children}
  </div>
}
