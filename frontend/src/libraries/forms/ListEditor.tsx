import React, {useMemo} from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

import {asFormControl} from 'libraries/forms'
import {Button} from 'libraries/ui'

import {FieldComponentProps, FieldPropsWithoutComponent, TypedStringPath} from './types'

import {Field} from './Field'

export interface Entity {
  _id: string | number
}

export interface UntypedListFieldProps<T, ValuePath, V extends Entity> extends Omit<ListFieldProps<T, V>, 'path'> {
  path: ValuePath
}

export interface ListFieldProps<T, V extends Entity> extends FieldPropsWithoutComponent<T, V[]> {
  isTable?: boolean
  component: ListItemComponent<T, V>
}
export function ListField<T, V extends Entity>({component, isTable, ...props} : ListFieldProps<T, V>) {
  return <Field<T, V[], ListEditorProps<T, V>> {...props} component={ListEditor} componentProps={{path: props.path, component, isTable}} />
}

interface ListEditorProps<T, V extends Entity> extends FieldComponentProps<V[]> {
  isTable?: boolean
  path: TypedStringPath<V[], T>
  component: ListItemComponent<T, V>
}

type ListItemComponent<T, V> = React.ComponentType<{
  path: TypedStringPath<V, T>
  itemIndex: number
  dragHandle: React.ReactNode
}>

export function ListEditor<T, V extends Entity>({value, onChange, path, component, hasConflict, inline, readOnly, isTable}: ListEditorProps<T, V>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const items = value ?? []

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item._id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => {
          return <SortableItem key={item._id} id={item._id} path={path} itemIndex={index} component={component} isTable={isTable} />
        })}
      </SortableContext>
    </DndContext>
  )

  function handleDragEnd(event) {
    const {active, over} = event

    if (active.id !== over.id) {
      onChange((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id)
        const newIndex = items.findIndex(i => i._id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }
}

export function SortableItem({id, path, itemIndex, component: Component, isTable}) {
  const {
    isDragging,
    attributes: { tabIndex, ...attributes},
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id})

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
  const dragHandle = useMemo(() => <DragHandle {...listeners} />, [listeners])

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes}>
      <Component path={path} itemIndex={itemIndex} dragHandle={dragHandle}/>
    </Wrapper>
  )
}

export const DragHandle = asFormControl((props) => <Button type="button" icon="move" {...props} />)
