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
  const {setNodeRef, isOver } = useDroppable({
    disabled,
    id: useId(),
    data,
  })
  const style = {
    outline: isOver ? '2px solid gray' : '1px solid lightgray',
    padding: 5,
    minHeight: 30,
  }

  return <Wrapper ref={setNodeRef} style={style}>
    {children}
  </Wrapper>
}
