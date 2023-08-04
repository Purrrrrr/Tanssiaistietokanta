import React, {useContext, useMemo} from 'react'
import {
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

import {Icon} from 'libraries/ui'

import {Entity, ListEditorDroppableData, ListEditorItemData, ListItemComponent} from './types'

import {FieldComponentProps, OnChangeHandler, TypedStringPath} from '../types'
import {ListEditorContext, ListEditorMoveContext} from './ListEditorContext'

export interface ListEditorProps<T, V extends Entity> extends FieldComponentProps<V[]> {
  itemType?: string
  droppableElement?: HTMLElement | null
  acceptsTypes?: string[]
  isTable?: boolean
  accessibilityContainer?: Element | undefined
  path: TypedStringPath<V[], T>
  component: ListItemComponent<T, V>
}

export function ListEditor<T, V extends Entity>({
  value, onChange, path, itemType, acceptsTypes, droppableElement, component: Component, inline, readOnly, isTable, accessibilityContainer
}: ListEditorProps<T, V>) {
  const items = value ?? []

  if (readOnly) {
    const Wrapper = isTable ? 'tr' : 'div'
    return <React.Fragment>
      {items.map((item, index) =>
        <Wrapper key={item._id}><Component path={path} itemIndex={index} dragHandle={null}/></Wrapper>
      )}
    </React.Fragment>
  }

  const itemDom = <ListEditorItems
    items={items}
    itemType={itemType}
    acceptsTypes={acceptsTypes}
    path={path}
    onChange={onChange}
    component={Component}
    isTable={isTable}
  />

  return (
    <ListEditorContext accessibilityContainer={accessibilityContainer}>
      {acceptsTypes
        ? <Droppable
          element={droppableElement}
          acceptsTypes={acceptsTypes}
          path={path}
          onChangePath={onChange as OnChangeHandler<unknown>}>
          {itemDom}
        </Droppable>
        : itemDom}
    </ListEditorContext>
  )
}

function ListEditorItems<T,V>({items, itemType, acceptsTypes, path, onChange, component, isTable}) {
  const move = useContext(ListEditorMoveContext)
  const filteredItems = move
    ? items.filter(item => item._id !== move.activeId)
    : items

  const ids = filteredItems.map(item => item._id)
  const wrappers = filteredItems.map((item, index) => {
    return <SortableItem<T, V> key={item._id} id={item._id} type={itemType} acceptsTypes={acceptsTypes} path={path} onChangePath={onChange} itemIndex={index} component={component} isTable={isTable} />
  })

  if (move && move.overPath === path) {
    const { activeId, activePath, active: {data} } = move
    ids.push(activeId)
    wrappers.push(<SortableItem<any, any>
      key={activeId}
      id={activeId}
      type={data.current!.type}
      acceptsTypes={data.current!.acceptsTypes}
      path={activePath}
      onChangePath={data.current!.onChange}
      itemIndex={data.current!.itemIndex}
      component={data.current!.component}
      isTable={isTable}
    />)
  }

  return <SortableContext items={ids} strategy={verticalListSortingStrategy} >
    {wrappers}
  </SortableContext>
}

interface SortableItemProps<T, V> {
  acceptsTypes?: string[]
  type?: string
  id: string | number
  isTable?: boolean
  component: ListItemComponent<T, V>
  path: TypedStringPath<V[], T>
  onChangePath: OnChangeHandler<V[]>
  itemIndex: number
}

export function SortableItem<T, V>({type, acceptsTypes, id, path, onChangePath, itemIndex, component: Component, isTable}: SortableItemProps<T, V>) {
  const {
    isDragging,
    attributes: { tabIndex, ...attributes},
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type,
      acceptsTypes,
      path,
      onChangePath: onChangePath as OnChangeHandler<unknown>,
      itemIndex,
      component: Component as ListItemComponent<unknown, unknown>,
    } satisfies ListEditorItemData,
  })

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
    () => <button type="button" className="bp4-button" ref={setActivatorNodeRef} style={{touchAction: 'none'}} {...listeners}><Icon icon="move" /></button>,
    [listeners, setActivatorNodeRef]
  )

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes}>
      <Component path={path} itemIndex={itemIndex} dragHandle={dragHandle}/>
    </Wrapper>
  )
}

interface DroppableProps extends ListEditorDroppableData {
  element?: HTMLElement | null
  children: JSX.Element | JSX.Element[]
}

function Droppable({children, element, acceptsTypes, path, onChangePath}: DroppableProps) {
  const {setNodeRef} = useDroppable({
    id: 'droppable:'+path,
    data: { acceptsTypes, path, onChangePath} satisfies ListEditorDroppableData
  })

  if (element !== undefined) {
    setNodeRef(element)
    return <>{children}</>
  }

  return <div ref={setNodeRef} >
    {children}
  </div>
}
