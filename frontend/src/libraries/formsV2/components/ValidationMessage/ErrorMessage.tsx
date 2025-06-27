import { Errors } from '../../types'

export function ErrorMessage(
  {id, error} :
  {id ?: string, error?: Errors}
) {
  return error ?
    <p id={id} className="mt-1.5 text-red-600">
      {error.join(', ')}
    </p> : null
}
