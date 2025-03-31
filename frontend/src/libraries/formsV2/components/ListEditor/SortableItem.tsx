import {useMemo} from 'react'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

import { useFormTranslation } from 'libraries/formsV2/localization'
import {Icon} from 'libraries/ui'

interface SortableItemProps<Data> {
  id: string | number
  data: Data
  children: React.ReactNode
}

export function SortableItem<Data extends Record<string, unknown>>({id, data, children}: SortableItemProps<Data>) {
  const isGhost = data?.ghost
  const {
    isDragging,
    attributes: { tabIndex: _ignored, ...attributes},
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data,
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

  const Wrapper = 'div'
  const dragHandle = useMemo(
    () => <DragHandle buttonRef={setActivatorNodeRef} listeners={listeners} />,
    [listeners, setActivatorNodeRef]
  )

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes}>
      {id}
      {dragHandle}
      {children}
    </Wrapper>
  )
}

function DragHandle({buttonRef, listeners}) {
  const moveLabel = useFormTranslation('moveItem')
  return <button
    type="button"
    aria-label={moveLabel}
    className="bp5-button"
    ref={buttonRef}
    style={{touchAction: 'none'}}
    {...listeners}>
    <Icon icon="move" />
  </button>
}
