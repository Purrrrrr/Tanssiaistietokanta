import { CSSProperties, ElementType, useId } from 'react'
import { useDroppable } from '@dnd-kit/core'

import { DroppableData, ListItem } from './types'
import type { AnyType, DataPath } from '../../../types'

export interface DroppableProps<Value extends ListItem, Data = AnyType> {
  id: string
  path: DataPath<Value[], Data>
  asElement?: DroppableElement
  children?: React.ReactNode
  disabled?: boolean
}

export type DroppableElement = ElementType<{ style: CSSProperties | undefined }>

export function DropArea<Value extends ListItem, Data = AnyType>({
  id, path, asElement = 'div', children, disabled,
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

  const Wrapper = asElement as unknown as 'div'

  return <Wrapper ref={setNodeRef} style={style}>
    {children}
  </Wrapper>
}
