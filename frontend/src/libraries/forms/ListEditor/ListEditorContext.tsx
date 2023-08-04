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
import * as L from 'partial.lenses'

import {ListEditorItemData} from './types'

import {useOnChangeFor} from '../hooks'
import {toArrayPath} from '../types'

const HasListEditorContext = createContext<boolean>(false)

interface ListEditorMove {
  overPath: string | number
  overData: ListEditorItemData
  activeId: string | number
  activeData: ListEditorItemData
}
export const ListEditorMoveContext = createContext<ListEditorMove | null>(null)

export interface ListEditorContextProps {
  accessibilityContainer?: Element | undefined
  children: JSX.Element | JSX.Element[]
}
export function ListEditorContext({accessibilityContainer, children}: ListEditorContextProps) {
  const hasExistingContext = useContext(HasListEditorContext)
  if (hasExistingContext) return <>{children}</>

  return (
    <ListEditorContextInner accessibilityContainer={accessibilityContainer}>
      <HasListEditorContext.Provider value={true}>
        {children}
      </HasListEditorContext.Provider>
    </ListEditorContextInner>
  )
}

export function ListEditorContextInner({accessibilityContainer, children}: ListEditorContextProps) {
  const onChange = useOnChangeFor('')
  const [move, setMove] = useState<ListEditorMove | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, useMemo(() => ({
      coordinateGetter: sortableKeyboardCoordinates,
    }), []))
  )
  // console.log(`move ${move?.activeData.path} -> ${move?.overPath}`)

  const onDragOver = useCallback(
    ({over, active}: DragOverEvent) => {
      const activeData = getData(active)
      const overData = getData(over)
      //console.log(overData)
      if (!activeData || !over || !overData) return
      //console.log(overData.path+'  '+overData.itemIndex)
      if (over.id === active.id) {
        // console.log('over itself?')
        return
      }
      if (activeData.path === overData.path) {
        if (move) {
          setMove(null)
          // console.log(activeData)
        }
        return
      }
      if (activeData.type && overData.acceptsTypes?.includes?.(activeData?.type)) {
        //console.log('move '+overData.path)
        setMove({
          overPath: overData.path,
          overData,
          activeId: active.id,
          activeData,
        })
      }
    },
    [move]
  )
  const handleDragEnd = useCallback(
    function handleDragEnd(event: DragEndEvent) {
      setMove(null)
      const {active, over} = event

      if (over === null) return
      if (active.id === over.id) return
      const activeData = getData(active)
      const overData = getData(over)
      if (activeData !== undefined && overData !== undefined) {
        if (activeData.path === overData.path) {
          activeData.onChangePath((items: unknown[]) => arrayMove(items, activeData.itemIndex, overData.itemIndex))
        } else if (move) {
          onChange(formValue => {
            const movePath = [...toArrayPath(activeData.path as any), activeData.itemIndex]
            const moved = L.get(movePath, formValue)
            return L.set(
              [...toArrayPath(move.overData.path as any), L.slice(overData.itemIndex, 0)],
              [moved],
              L.remove(movePath, formValue)
            )
          })
        }
      }
    },
    [move, onChange]
  )

  return (
    <DndContext
      accessibility={{container: accessibilityContainer}}
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragOver={onDragOver}
      onDragEnd={handleDragEnd}
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

function getData(item: Active | Over | DroppableContainer | undefined | null): ListEditorItemData | undefined {
  return item?.data?.current as (ListEditorItemData | undefined)
}
