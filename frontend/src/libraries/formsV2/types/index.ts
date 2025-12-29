export type { AnyType, DataPath, FieldPath, GenericPath, ListItem, ListPath } from './paths'
export { toArrayPath } from './paths'
export type { ValueAt } from './valueAt'

export type ErrorDisplay = 'always' | 'onSubmit'

export type SpecializedFieldComponent<P> = (props: Omit<P, 'component'>) => React.ReactElement

export type Errors = string[] | undefined
