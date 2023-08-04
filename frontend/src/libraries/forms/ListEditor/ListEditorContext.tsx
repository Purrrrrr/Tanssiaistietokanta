import React, {createContext, useCallback, useContext, useMemo, useState} from 'react'
import {
  Active,
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DroppableContainer,
  KeyboardSensor,
  Over,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import {ListEditorItemData} from './types'

const HasListEditorContext = createContext<boolean>(false)

interface ListEditorMove {
  over: Over
  overPath: string | number
  active: Active
  activeId: string | number
  activePath: string | number
}
export const ListEditorMoveContext = createContext<ListEditorMove | null>(null)

export interface ListEditorContextProps {
  accessibilityContainer?: Element | undefined
  children: React.ReactElement
}
export function ListEditorContext({accessibilityContainer, children}: ListEditorContextProps) {
  const hasExistingContext = useContext(HasListEditorContext)
  if (hasExistingContext) return children

  return (
    <ListEditorContextInner accessibilityContainer={accessibilityContainer}>
      <HasListEditorContext.Provider value={true}>
        {children}
      </HasListEditorContext.Provider>
    </ListEditorContextInner>
  )
}

export function ListEditorContextInner({accessibilityContainer, children}: ListEditorContextProps) {
  const [move, setMove] = useState<ListEditorMove | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, useMemo(() => ({
      coordinateGetter: sortableKeyboardCoordinates,
    }), []))
  )
  console.log(`move ${move?.activePath} -> ${move?.overPath}`)

  const onDragOver = useCallback(
    ({over, active}: DragOverEvent) => {
      const activeData = getData(active)
      const overData = getData(over)
      //console.log(overData)
      if (!activeData || !over || !overData) return
      //console.log(overData.path+'  '+overData.itemIndex)
      if (over.id === active.id) {
        console.log('over itself?')
        return
      }
      if (activeData.path === overData.path) {
        if (move) {
          console.log(activeData)
          setMove(null)
        }
        return
      }
      if (activeData.type && overData.acceptsTypes?.includes?.(activeData?.type)) {
        //console.log('move '+overData.path)
        setMove({
          over,
          overPath: overData.path,
          active,
          activePath: activeData.path,
          activeId: active.id,
        })
      }
    },
    [move]
  )

  return (
    <DndContext
      accessibility={{container: accessibilityContainer}}
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragOver={onDragOver}
      onDragEnd={e => {handleDragEnd(e); setMove(null)}}
      onDragCancel={() => setMove(null)}
    >
      <ListEditorMoveContext.Provider value={move}>
        {children}
      </ListEditorMoveContext.Provider>
    </DndContext>
  )
}

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const activeData = getData(args.active)
  if (!activeData) return closestCenter(args)

  return closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => {
        const containerData = getData(container)
        if (containerData?.path === activeData.path) return true
        //if (containerData?.acceptsTypes) console.log(containerData.itemIndex, containerData.acceptsTypes)
        if (activeData.type && containerData?.acceptsTypes?.includes?.(activeData.type)) {
          return true
        }
        return false
      }
    ),
  })
}

function handleDragEnd(event: DragEndEvent) {
  const {active, over} = event

  if (over === null) return
  if (active.id !== over.id) {
    const activeData = getData(active)
    const overData = getData(over)
    if (activeData !== undefined && overData !== undefined) {
      if (activeData.path === overData.path) {
        activeData.onChangePath((items: unknown[]) => arrayMove(items, activeData.itemIndex, overData.itemIndex))
        return
      }
    }
  }
}

function getData(item: Active | Over | DroppableContainer | undefined | null): ListEditorItemData | undefined {
  return item?.data?.current as (ListEditorItemData | undefined)
}
