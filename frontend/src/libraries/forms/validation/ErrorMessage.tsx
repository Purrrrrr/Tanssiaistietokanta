import React from 'react'
import { Colors } from '@blueprintjs/core'

export interface Error {
  errors: string[]
}

export function ErrorMessage(
  {id, error} :
  {id ?: string, error: Error | null}
) {
  return error !== null ?
    <p id={id} style={{ color: Colors.RED2, marginTop: 5 }}>
      {error.errors.join(', ')}
    </p> : null
}
