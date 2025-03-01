import { type Schema } from 'yup'

export type { FieldPath, PathFor } from './paths'
export { isSubPathOf, toArrayPath } from './paths'
export type { ValueAt } from './valueAt'

export interface ValidationProps {
  required?: boolean
  schema?: Schema
}

export type ErrorMap = Partial<Record<string, Errors>>
export type Errors = string[] | undefined


