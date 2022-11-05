import React from 'react'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import {arrayMoveImmutable} from 'array-move'

import {useOnChangeFor, useValueAt} from '../hooks'
import {StringPath, StringPathToList} from '../types'

/** Create a drag and drop list from items with the specified component
 *
 * Props:
 * items: The items to create a list from
 * onChange: a change handler that receives a changed items list
 * children: The list items, by default renders a ListEditorItems component with the supplied props
 */
export type ListEditorProps<T> = Omit<ListEditorItemsProps<T>, 'component'> & (
  {children: React.ReactNode, component?: undefined} | {children?: undefined | null, component: any}
)

export function ListEditor<T>({path, children, component} : ListEditorProps<T>) {
  const onChange = useOnChangeFor(path as StringPath<unknown>)
  function onSortEnd({oldIndex, newIndex}) {
    onChange(items => arrayMoveImmutable(items, oldIndex, newIndex))
  }

  return <SortableList distance={5} onSortEnd={onSortEnd} useDragHandle>
    {children ?? <ListEditorItems<T> path={path} component={component} />}
  </SortableList>
}

export interface ListEditorItemsProps<T> {
  path: StringPathToList<T>
  component: unknown,
}

export function ListEditorItems<T>({path, component} : ListEditorItemsProps<T>) {
  const items = useValueAt(path as StringPath<unknown>) as unknown[]
  return <>
    {items.map((item, index) =>
      <SortableItem
        key={objectId(item, index)}
        index={index}
        path={path as StringPath<unknown>}
        itemIndex={index}
        component={component}
      />
    )}
  </>
}

const hasId = (value): value is {_id: unknown} => '_id' in value
export function objectId(value: unknown, i: number): string | number {
  if (typeof value === 'object' && value !== null) {
    if (hasId(value)) {
      const id = value._id
      return typeof(id) === 'string' || typeof id === 'number' ? id : i
    }
  }
  return i
}

interface SortableItemProps {
  path: StringPath<unknown>
  component?: any
  itemIndex: number
}

const SortableList = SortableContainer(props => <div {...props} />)
const SortableItem = SortableElement<SortableItemProps>(React.memo(
  ({component: Component, itemIndex, path}) => {
    return <Component tabIndex={0} path={path} itemIndex={itemIndex} />
  }
))
