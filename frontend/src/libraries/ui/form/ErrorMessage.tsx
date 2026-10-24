export type Errors = string[] | null | undefined

export function ErrorMessage(
  { id, errors, error }:
  { id?: string, error?: string | null, errors?: Errors },
) {
  const msg = error ?? errors?.join(', ')
  return msg
    ? <p id={id} className="mt-1.5 text-red-800">{msg}</p>
    : null
}
