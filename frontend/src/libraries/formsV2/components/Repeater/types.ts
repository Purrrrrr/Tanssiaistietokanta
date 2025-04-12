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
  itemType: string | undefined
  value: T
  ghost?: boolean
}

export type AcceptedTypes<T, TypeDefinitions> = AcceptedType<T, TypeDefinitions>[]

export type AcceptedType<T, TypeDefinitions> = {
  [K in keyof TypeDefinitions]: TypeDefinitions[K] extends T ? K : never
}[keyof TypeDefinitions]

export type ItemTypeClassifier<T, TypeDefinitions> = (value: T) => ItemClassification<T, TypeDefinitions>

export type ItemClassification<T, TypeDefinitions> = {
  [K in keyof TypeDefinitions]: [K, TypeDefinitions[K]]
}[keyof TypeDefinitions]
