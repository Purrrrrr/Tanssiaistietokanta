import { OnChangeHandler, TypedStringPath } from '../types'

export interface Entity {
  _id: string | number
}

export type ListItemComponent<T, V, P = object> = React.ComponentType<{
  path: TypedStringPath<V[], T>
  itemIndex: number
  dragHandle: DragHandle
} & P>

export type DragHandle = React.ReactNode

export interface ListEditorDroppableData {
  acceptsTypes?: string[]
  path: string | number
  onChangePath: OnChangeHandler<unknown>
}
export interface ListEditorItemData extends ListEditorDroppableData {
  type?: string
  itemIndex: number
  component: ListItemComponent<unknown, unknown>
}
