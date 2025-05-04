import {createContext, useCallback, useMemo, useState} from 'react'
import {
  closestCenter,
  DndContext as DndKitContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import type { AnyType } from '../../types'
import type { DroppableData, ItemData } from './Repeater/types'

import { useFormContext } from '../../context'

interface ItemVisit {
  to: ItemData | DroppableData
  item: ItemData
}

export const ItemVisitContext = createContext<ItemVisit | null>(null)

export function DndContext({children}: {children: React.ReactNode}): React.ReactNode {
  const { getValueAt, dispatch } = useFormContext<AnyType>()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, useMemo(() => ({
      coordinateGetter: sortableKeyboardCoordinates,
      scrollBehavior: 'instant' as const,
    }), []))
  )
  const [visit, setVisit] = useState<ItemVisit | null>(null)

  const onDragOver = useCallback(
    ({ over, active }: DragOverEvent) => {
      if (!over?.data.current || !active.data.current) return

      const activeData = active.data.current as ItemData
      const overData = over.data.current as ItemData | DroppableData
      if (activeData === overData) return
      if (activeData.dropAreaId === undefined) return

      if (activeData.dropAreaId === overData.dropAreaId) {
        setVisit(null)
        return
      }
      const {
        type, id, dropAreaId, path, index, value, itemType,
      } = activeData
      setVisit({
        to: overData,
        item: {
          type, id, dropAreaId, path, index, value, itemType
        }
      })

    },
    []
  )
  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setVisit(null)

      if (over === null) return
      if (active.id === over.id && !visit) return
      if (!over?.data.current || !active.data.current) return

      const activeData = active.data.current as ItemData
      const overData = visit?.to ?? over.data.current as ItemData | DroppableData

      if (activeData.path === overData.path || visit) {
        //Somehow this seems to work like this
        const insertingToLastPlace = visit && active.id === over.id
        dispatch({
          type: 'MOVE_ITEM',
          from: activeData.path,
          fromIndex: activeData.index,
          to: overData.path,
          toIndex: insertingToLastPlace
            ? getValueAt<unknown[]>(overData.path).length
            : overData.type === 'item' ? overData.index : 0,
        })
      }

    },
    [visit, dispatch, getValueAt]
  )

  return (
    <DndKitContext
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}>
      <ItemVisitContext.Provider value={visit}>
        {children}
      </ItemVisitContext.Provider>
    </DndKitContext>
  )
}
