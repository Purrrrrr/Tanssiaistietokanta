import React from 'react'
import { Colors } from '@blueprintjs/core'

export function ErrorMessage(
  {id, error} : 
  {id ?: string, error: {errors: string[]} | null}
) {
  return error !== null ?
    <p id={id} style={{ color: Colors.RED2, marginTop: 5 }}>
      {error.errors.join(', ')}
    </p> : null
}
