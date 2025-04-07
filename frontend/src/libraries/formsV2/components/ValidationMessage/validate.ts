import { type Schema, ValidationError } from 'yup'

import type { Errors } from '../../types'

export interface ValidationProps {
  required?: boolean
  schema?: Schema
}

export async function validate(props: ValidationProps, value: unknown): Promise<Errors> {
  if (props.required && (value === null || value === undefined || value === '')) {
    return ['is required']
  }
  if (props.schema) {
    try {
      props.schema.validate(value)
    } catch (e) {
      return (e as ValidationError).errors
    }
  }
  return undefined
}
