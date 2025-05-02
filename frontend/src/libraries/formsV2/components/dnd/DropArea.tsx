import { CSSProperties, ElementType, useId } from 'react'
import { useDroppable } from '@dnd-kit/core'

import { AcceptedTypes, DroppableData, ListItem } from './types'
import type { AnyType, DataPath } from '../../types'

import { useIsDropAreaDisabled } from './useIsDropAreaDisabled'

interface DroppableProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> {
  id: string
  path: DataPath<Value[], Data>
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
  asElement?: ElementType<{style: CSSProperties | undefined}>
  children?: React.ReactNode
  disabled?: boolean
}

export function DropArea<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>({
  id, path, accepts, asElement = 'div', children, disabled,
}: DroppableProps<Value, Data, AcceptedTypeDefs>) {
  const data = {
    type: 'droppable',
    path,
    dropAreaId: id,
  } satisfies DroppableData
  const {setNodeRef } = useDroppable({
    disabled: useIsDropAreaDisabled(id, accepts) || disabled,
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
