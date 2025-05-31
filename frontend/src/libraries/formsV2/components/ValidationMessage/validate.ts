import { type Schema, ValidationError } from 'yup'

import type { Errors } from '../../types'

export interface ValidationProps<T> {
  required?: boolean
  schema?: Schema<T>
}

export async function validate<T>(props: ValidationProps<T>, value: T): Promise<Errors> {
  if (props.required && (value === null || value === undefined || value === '')) {
    return ['is required']
  }
  if (props.schema) {
    try {
      await props.schema.validate(value)
    } catch (e) {
      return (e as ValidationError).errors
    }
  }
  return undefined
}
