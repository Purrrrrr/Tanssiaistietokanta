import {useMemo} from 'react'
import {array, number, Schema, string} from 'yup'

import { useFormStrings } from '../formContext'

type Type = 'list' | 'number' | 'text' | 'email'

export interface ValidationProps {
  type?: Type
  required?: boolean
  schema?: Schema
}

export function useSchema(schemaDef: ValidationProps) {
  const { type, required, schema } = schemaDef
  const messages = useFormStrings().validation
  return useMemo(
    () => {
      if (schema) return schema
      if (!type && !required) return null

      return required
        ? baseValidator(type).required(value => Array.isArray(value)
          ? messages.requiredList
          : messages.required
        )
        : baseValidator(type).nullable()
    },
    [type, required, schema, messages.required, messages.requiredList]
  )
}

function baseValidator(type?: Type) {
  switch(type) {
    case 'list':
      return array()
    case 'number':
      return number()
    case 'email':
      return string().email()
    case 'text':
    default:
      return string()
  }
}
