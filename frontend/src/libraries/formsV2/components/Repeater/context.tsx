import {createContext, useCallback, useMemo, useState} from 'react'
import {
  closestCenter,
  CollisionDetection,
  DndContext,
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

import type { DroppableData, ItemData } from './types'
import type { AnyType } from '../../types'

import { useFormContext } from '../../context'

interface ItemVisit {
  to: ItemData | DroppableData
  item: ItemData
}

export const ItemVisitContext = createContext<ItemVisit | null>(null)

export function RepeaterContext({children}: {children: React.ReactNode}): React.ReactNode {
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
      console.log(`over ${over?.id}`)
      if (!over?.data.current || !active.data.current) return

      const activeData = active.data.current as ItemData
      const overData = over.data.current as ItemData | DroppableData
      if (activeData === overData) return
      if (activeData.fieldId === undefined) return

      if (activeData.fieldId === overData.fieldId) {
        setVisit(null)
        return
      }
      const {
        type, id, fieldId, path, index, value
      } = activeData
      setVisit({
        to: overData,
        item: {
          type, id, fieldId, path, index, value
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
    <DndContext
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      sensors={sensors}
      collisionDetection={closestCenter}>
      <ItemVisitContext.Provider value={visit}>
        {children}
      </ItemVisitContext.Provider>
    </DndContext>
  )
}

const droppablePadding = 10

const collisionDetectionStrategy: CollisionDetection = (args) => {
  //const activeData = getData(args.active)
  //if (!activeData) return closestCenter(args)
  console.log(args.droppableContainers)

  return closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter(c => c.id !== args.active.id),
    //.map(
    //  (container) => {
    //    const data = container.data.current
    //    if (data?.type === 'droppable' && container.rect.current ) {
    //      const { width, height, top, left, right, bottom } = container.rect.current
    //      return {
    //        ...container,
    //        rect: {
    //          current: {
    //            width: width + droppablePadding * 2,
    //            height: height + droppablePadding * 2,
    //            top: top - droppablePadding,
    //            left: left - droppablePadding,
    //            right: right + droppablePadding,
    //            bottom: bottom + droppablePadding,
    //          },
    //        },
    //      }
    //    }
    //    return container
    //  }
    //),
  })
}
