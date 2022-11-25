import {useMemo} from 'react'

import {useDeepCompareMemoize} from './utils/useDeepCompareMemoize'
import validators from './utils/yup'

type Type = 'list' | 'number' | 'text' | 'email';

export interface ValidationProps {
  type?: Type,
  required?: boolean,
  min?: number,
  minLength?: number,
  max?: number,
  maxLength?: number,
  pattern?: string,
  errorMessages?: Record<string, string | ((argument: {value: unknown, values: unknown}) => string)>,
  validate?: Record<string, unknown>,
}

export function useSchema(schema : ValidationProps) {
  const normalizedSchema = useDeepCompareMemoize(normalize(schema))
  return useMemo(
    () => getSchema(normalizedSchema),
    [normalizedSchema]
  )
}

export function stripValidationProps<P extends object>(props : P) : Omit<P, 'validate' | 'errorMessages'> {
  const ret = {...props}
  if ('validate' in ret) delete ret['validate']
  if ('errorMessages' in ret) delete ret['errorMessages']
  return ret
}

function normalize({type, required, min, minLength, max, maxLength, pattern, errorMessages, validate} : ValidationProps) {
  return {
    type: normalizeType(type),
    required,
    min: min ?? minLength,
    max: max ?? maxLength,
    matches: pattern,
    email: type === 'email' ? true : undefined,
    errorMessages: errorMessages ?? {},
    ...validate
  }
}

function normalizeType(type ?: Type) {
  switch(type) {
    case 'list':
      return 'array'
    case 'number':
      return 'number'
    case 'text':
    default:
      return 'string'
  }
}

function getSchema({type, errorMessages, ...spec}) {
  let schema = validators[type]()
  let unvalidated = true
  for(const [key, val] of Object.entries(spec)) {
    if (val === undefined) continue
    if (!schema[key]) continue
    unvalidated = false

    const args = noArguments[key] ? [] : [val]
    const message = errorMessages[key]
    if (message) {
      args.push(message)
    }
    schema = schema[key](...args)
  }
  return unvalidated ? null : schema
}

const noArguments = {
  required: true,
  email: true
}
