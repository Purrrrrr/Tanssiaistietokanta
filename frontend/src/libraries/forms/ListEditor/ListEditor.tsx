import React, { useContext, useId, useMemo } from 'react'
import { Move } from '@blueprintjs/icons'
import {
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Entity, ListEditorDroppableData, ListEditorItemData, ListItemComponent } from './types'
import { FieldComponentProps, OnChangeHandler, TypedStringPath } from '../types'

import { Button } from 'libraries/ui'

import { useFormStrings } from '../formContext'
import { ListEditorContext, ListEditorMoveContext } from './ListEditorContext'

export interface ListEditorProps<T, V extends Entity, P = object> extends FieldComponentProps<V[]> {
  itemType?: string | ((value: V) => string)
  droppableElement?: HTMLElement | null
  acceptsTypes?: string[]
  isTable?: boolean
  accessibilityContainer?: Element | undefined
  path: TypedStringPath<V[], T>
  itemClassname?: string
  component: ListItemComponent<T, V, P>
  componentProps?: P
}

export function ListEditor<T, V extends Entity>({
  value, onChange, path, itemType, acceptsTypes, droppableElement, component: Component, inline: _ignored, readOnly, isTable, accessibilityContainer, componentProps, itemClassname,
}: ListEditorProps<T, V>) {
  const items = value ?? []

  if (readOnly) {
    const Wrapper = isTable ? 'tr' : 'div'
    return <React.Fragment>
      {items.map((item, index) =>
        <Wrapper key={item._id} className={itemClassname}><Component path={path} itemIndex={index} dragHandle={null} {...componentProps} /></Wrapper>,
      )}
    </React.Fragment>
  }

  const itemDom = <ListEditorItems<T, V>
    items={items}
    itemType={itemType}
    acceptsTypes={acceptsTypes}
    path={path}
    onChangePath={onChange}
    component={Component}
    componentProps={componentProps}
    isTable={isTable}
    className={itemClassname}
  />

  return (
    <ListEditorContext accessibilityContainer={accessibilityContainer}>
      {acceptsTypes
        ? (
          <Droppable
            element={droppableElement}
            acceptsTypes={acceptsTypes}
            path={path}
            onChangePath={onChange as OnChangeHandler<unknown>}
          >
            {itemDom}
          </Droppable>
        )
        : itemDom
      }
    </ListEditorContext>
  )
}

interface ListEditorItemsProps<T, V> extends Omit<SortableItemProps<T, V>, 'id' | 'itemIndex' | 'itemType'> {
  itemType?: string | ((value: V) => string)
  items: V[]
}
function ListEditorItems<T, V extends Entity>({ items, itemType, acceptsTypes, path, onChangePath, component, componentProps, isTable, className }: ListEditorItemsProps<T, V>) {
  const componentId = useId()
  const move = useContext(ListEditorMoveContext)
  const filteredItems = move
    ? items.filter(item => item._id !== move.activeId)
    : items

  const ids = filteredItems.map(item => `${componentId}-${item._id}`) as (string | number)[]
  const wrappers = filteredItems.map((item, index) => {
    const type = typeof itemType === 'function' ? itemType(item) : itemType
    return <SortableItem<T, V> key={item._id} id={`${componentId}-${item._id}`} itemType={type} acceptsTypes={acceptsTypes} path={path} onChangePath={onChangePath} itemIndex={index} component={component} isTable={isTable} componentProps={componentProps} className={className} />
  })

  if (move?.overPath === path) {
    const { activeId, activeData } = move
    ids.push(activeId)
    wrappers.push(
      <SortableItem
        key={activeId}
        id={activeId}
        itemType={activeData.type}
        acceptsTypes={activeData.acceptsTypes}
        path={activeData.path}
        onChangePath={activeData.onChangePath as OnChangeHandler<V[]>}
        itemIndex={activeData.itemIndex}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={activeData.component as ListItemComponent<any, V>}
        componentProps={componentProps}
        isTable={isTable}
        className={className}
      />,
    )
  }

  return <SortableContext items={ids} strategy={verticalListSortingStrategy}>
    {wrappers}
  </SortableContext>
}

interface SortableItemProps<T, V, P = object> {
  acceptsTypes?: string[]
  itemType?: string
  id: string | number
  isTable?: boolean
  component: ListItemComponent<T, V, P>
  componentProps?: P
  path: TypedStringPath<V[], T>
  onChangePath: OnChangeHandler<V[]>
  itemIndex: number
  className?: string
}

export function SortableItem<T, V>({ itemType, acceptsTypes, id, path, onChangePath, itemIndex, component: Component, isTable, componentProps, className }: SortableItemProps<T, V>) {
  const {
    isDragging,
    attributes: { tabIndex: _ignored, ...attributes },
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: itemType,
      acceptsTypes,
      path,
      onChangePath: onChangePath as OnChangeHandler<unknown>,
      itemIndex,
      component: Component as ListItemComponent<unknown, unknown>,
    } satisfies ListEditorItemData,
  })
  const { moveItem } = useFormStrings()

  const scale = isDragging ? 1.01 : 1

  const style = {
    transform: CSS.Transform.toString({
      x: 0, y: 0,
      ...transform,
      scaleX: scale,
      scaleY: scale,
    }),
    transition,
    boxShadow: isDragging ? '4px 4px 4px rgba(33, 33, 33, 0.45)' : undefined,
  }

  const Wrapper = isTable ? 'tr' : 'div'
  const dragHandle = useMemo(
    () => <Button aria-label={moveItem} className="touch-none" icon={<Move />} ref={setActivatorNodeRef} {...listeners} />,
    [listeners, setActivatorNodeRef, moveItem],
  )

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes} className={className}>
      <Component path={path} itemIndex={itemIndex} dragHandle={dragHandle} {...componentProps} />
    </Wrapper>
  )
}

interface DroppableProps extends ListEditorDroppableData {
  element?: HTMLElement | null
  children: JSX.Element | JSX.Element[]
}

function Droppable({ children, element, acceptsTypes, path, onChangePath }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id: 'droppable:' + path,
    data: { acceptsTypes, path, onChangePath } satisfies ListEditorDroppableData,
  })

  if (element !== undefined) {
    setNodeRef(element)
    return <>{children}</>
  }

  return <div ref={setNodeRef}>
    {children}
  </div>
}
