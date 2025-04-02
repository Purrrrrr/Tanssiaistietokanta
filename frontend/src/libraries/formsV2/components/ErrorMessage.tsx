import { Colors } from '@blueprintjs/core'

import { Errors } from '../types'

export function ErrorMessage(
  {id, error} :
  {id ?: string, error?: Errors}
) {
  return error ?
    <p id={id} style={{ color: Colors.RED2, marginTop: 5 }}>
      {error.join(', ')}
    </p> : null
}
