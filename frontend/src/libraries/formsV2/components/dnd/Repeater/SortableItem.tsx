import { useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from 'libraries/ui'
import { Move } from 'libraries/ui/icons'

import { useFormTranslation } from '../../../localization'

interface SortableItemProps<Data> {
  id: string | number
  data: Data
  disabled?: boolean
  itemClassName?: string
  children: (dragHandle: React.ReactNode) => React.ReactNode
}

export function SortableItem<Data extends Record<string, unknown>>({ id, data, disabled, children, itemClassName }: SortableItemProps<Data>) {
  const isGhost = data?.ghost
  const {
    isDragging,
    attributes: { tabIndex: _ignored, ...attributes },
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id, data, disabled: disabled ? { draggable: true, droppable: true } : false,
  })

  const isRisen = isDragging && !isGhost
  const scale = isRisen ? 1.01 : 1

  const style = {
    transform: !isGhost ? CSS.Transform.toString({
      x: 0, y: 0,
      ...transform,
      scaleX: scale,
      scaleY: scale,
    }) : undefined,
    opacity: isGhost ? 0.3 : 1,
    transition,
    boxShadow: isRisen ? '4px 4px 4px rgba(33, 33, 33, 0.45)' : undefined,
  }

  const dragHandle = useMemo(
    () => <DragHandle buttonRef={setActivatorNodeRef} listeners={listeners} />,
    [listeners, setActivatorNodeRef],
  )

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={itemClassName}>
      {children(dragHandle)}
    </div>
  )
}

function DragHandle({ buttonRef, listeners }) {
  const moveLabel = useFormTranslation('moveItem')
  return <Button aria-label={moveLabel} className="touch-none" icon={<Move />} ref={buttonRef} {...listeners} />
}
