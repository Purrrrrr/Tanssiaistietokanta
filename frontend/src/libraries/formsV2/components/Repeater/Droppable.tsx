import { useId } from 'react'
import {
  useDroppable
} from '@dnd-kit/core'

interface DroppableProps<Data> {
  children?: React.ReactNode
  data: Data
  disabled?: boolean
  asElement?: 'div' | 'table'
}


export function Droppable<Data extends Record<string, unknown>>({children, data, disabled, asElement: Wrapper = 'div'}: DroppableProps<Data>) {
  const {setNodeRef } = useDroppable({
    disabled,
    id: useId(),
    data,
  })
  const style = {
    minHeight: 30,
  }

  return <Wrapper ref={setNodeRef} style={style}>
    {children}
  </Wrapper>
}
