import React  from 'react'

import {Entity, ListItemComponent} from './types'

import {Field} from '../Field'
import {FieldPropsWithoutComponent} from '../types'
import {ListEditor, ListEditorProps} from './ListEditor'

export interface UntypedListFieldProps<T, ValuePath, V extends Entity> extends Omit<ListFieldProps<T, V>, 'path'> {
  path: ValuePath
}

export interface ListFieldProps<T, V extends Entity> extends FieldPropsWithoutComponent<T, V[]>, Pick<ListEditorProps<T, V>, 'itemType' | 'droppableElement' | 'acceptsTypes' | 'accessibilityContainer' | 'isTable'> {
  component: ListItemComponent<T, V>
  renderConflictItem: (item: V) => string
}
export function ListField<T, V extends Entity>({accessibilityContainer, component, itemType, isTable, droppableElement, acceptsTypes, renderConflictItem, ...props} : ListFieldProps<T, V>) {
  return <Field<T, V[], ListEditorProps<T, V>> {...props} component={ListEditor} renderConflictItem={renderConflictItem} componentProps={{path: props.path, accessibilityContainer, component, isTable, itemType, acceptsTypes, droppableElement}} />
}

