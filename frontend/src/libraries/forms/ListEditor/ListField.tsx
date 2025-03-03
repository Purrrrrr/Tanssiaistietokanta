import {Entity, ListItemComponent} from './types'
import {FieldPropsWithoutComponent} from '../types'

import {Field} from '../Field'
import {ListEditor, ListEditorProps} from './ListEditor'

export interface UntypedListFieldProps<T, ValuePath, V extends Entity, P = object> extends Omit<ListFieldProps<T, V, P>, 'path'> {
  path: ValuePath
}

export interface ListFieldProps<T, V extends Entity, P = object>
  extends
  FieldPropsWithoutComponent<T, V[]>,
  Pick<ListEditorProps<T, V, P>, 'itemType' | 'droppableElement' | 'acceptsTypes' | 'accessibilityContainer' | 'isTable' | 'componentProps'>
{
  component: ListItemComponent<T, V, P>
  renderConflictItem: (item: V) => string
}
export function ListField<T, V extends Entity>({accessibilityContainer, component, itemType, isTable, droppableElement, acceptsTypes, renderConflictItem, componentProps, ...props} : ListFieldProps<T, V>) {
  return <Field<T, V[], ListEditorProps<T, V>> {...props} component={ListEditor} renderConflictItem={renderConflictItem} componentProps={{path: props.path, accessibilityContainer, component, isTable, itemType, acceptsTypes, droppableElement, componentProps}} />
}

