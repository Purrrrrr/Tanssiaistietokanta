export type ID = string | number
export type ListItem = ID | { _id: ID }

export type Path = string | number

export interface DroppableData {
  type: 'droppable',
  fieldId: string
  path: Path
}

export interface ItemData<T = unknown> extends Record<string, unknown> {
  type: 'item',
  id: ID
  fieldId: string
  path: Path
  index: number
  value: T
  ghost?: boolean
}
