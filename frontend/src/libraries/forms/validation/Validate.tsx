import { ErrorMessage } from './ErrorMessage'
import { useError } from './useError'
import { ValidationProps } from './useSchema'

interface ValidateProps extends ValidationProps {
  value?: unknown
}

export const Validate = function Validate({ value, ...schemaDef }: ValidateProps) {
  return <ErrorMessage error={useError(value, schemaDef)} />
}
