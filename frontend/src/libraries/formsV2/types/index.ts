export type { AnyType, DataPath, FieldPath, GenericPath } from './paths'
export { toArrayPath } from './paths'
export type { ValueAt } from './valueAt'

export type Errors = string[] | undefined

export interface Labelable {
  label: string
}
