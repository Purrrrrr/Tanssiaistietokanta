import { type Schema } from 'yup'

export type { FieldPath, PathFor } from './paths'
export { toArrayPath } from './paths'

export interface ValidationProps {
  required?: boolean
  schema?: Schema
}

export type ErrorMap = Partial<Record<string, Errors>>
export type Errors = string[]


