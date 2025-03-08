import { type Schema } from 'yup'

export type { AnyType, DataPath, FieldPath, GenericPath } from './paths'
export { isSubPathOf, toArrayPath } from './paths'
export type { ValueAt } from './valueAt'

export interface ValidationProps {
  required?: boolean
  schema?: Schema
}

export type Errors = string[] | undefined

export interface Labelable {
  label: string
}
