export interface Error {
  errors: string[]
}

export function ErrorMessage(
  { id, error }:
  { id?: string, error: Error | null },
) {
  return error !== null ?
    <p id={id} className="mt-1.5 text-red-800">
      {error.errors.join(', ')}
    </p> : null
}
