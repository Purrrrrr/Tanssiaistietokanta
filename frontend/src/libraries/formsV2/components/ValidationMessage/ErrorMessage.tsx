import { Errors } from '../../types'

export function ErrorMessage(
  {id, error} :
  {id ?: string, error?: Errors}
) {
  return error ?
    <p id={id} className="text-red-600 mt-1.5">
      {error.join(', ')}
    </p> : null
}
