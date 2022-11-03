import React from 'react'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import {arrayMoveImmutable} from 'array-move'

import {useOnChangeFor, useValueAt} from '../hooks'
import {Path, TypedPath} from '../types'

/** Create a drag and drop list from items with the specified component
 *
 * Props:
 * items: The items to create a list from
 * onChange: a change handler that receives a changed items list
 * children: The list items, by default renders a ListEditorItems component with the supplied props
 */
type ListEditorProps = Omit<ListEditorItemsProps, 'component'> & {
  path: TypedPath<any[], any>
} & (
  {children: React.ReactNode, component?: undefined} | {children?: undefined | null, component: any}
)

export function ListEditor({path, children, component} : ListEditorProps) {
  const onChange = useOnChangeFor(path as Path<unknown>)
  function onSortEnd({oldIndex, newIndex}) {
    onChange(items => arrayMoveImmutable(items, oldIndex, newIndex))
  }

  return <SortableList distance={5} onSortEnd={onSortEnd} useDragHandle>
    {children ?? <ListEditorItems path={path} component={component} />}
  </SortableList>
}

interface ListEditorItemsProps {
  path: TypedPath<any[], any>
  component: unknown,
}

export function ListEditorItems({path, component} : ListEditorItemsProps) {
  const items = useValueAt(path as Path<unknown>) as unknown[]
  return <>
    {items.map((item, index) =>
      <SortableItem
        key={objectId(item, index)}
        index={index}
        path={path}
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
  path: Path<any>
  component?: any
  itemIndex: number
}

const SortableList = SortableContainer(props => <div {...props} />)
const SortableItem = SortableElement<SortableItemProps>(React.memo(
  ({component: Component, itemIndex, path}) => {
    return <Component tabIndex={0} path={path} itemIndex={itemIndex} />
  }
))
