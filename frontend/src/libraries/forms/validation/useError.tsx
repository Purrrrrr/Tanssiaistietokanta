import { useEffect, useState } from 'react'

import { useUpdateErrorContext } from './context'
import { useSchema, ValidationProps } from './useSchema'

export function useError(value, schemaDef: ValidationProps) {
  const schema = useSchema(schemaDef)
  const [error, setError] = useState(null)
  useEffect(
    () => {
      if (!schema) {
        setError(null)
        return
      }
      schema.validate(value)
        .then(() => setError(null)).catch(setError)
    },
    [value, schema],
  )
  useUpdateErrorContext(error)
  return schema ? error : null
}
