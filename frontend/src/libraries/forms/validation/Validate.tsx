import { useFormMetadata } from '../formContext'
import { ErrorMessage } from './ErrorMessage'
import { useError } from './useError'
import { ValidationProps } from './useSchema'

interface ValidateProps extends ValidationProps {
  value?: unknown
}

export const Validate = function Validate({ value, ...schemaDef }: ValidateProps) {
  const error = useError(value, schemaDef)
  const { showErrors } = useFormMetadata()
  return <ErrorMessage error={showErrors ? error : null} />
}
