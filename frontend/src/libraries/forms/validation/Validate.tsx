import { ErrorMessage } from '@/libraries/ui/form/ErrorMessage'

import { useFormMetadata } from '../formContext'
import { useError } from './useError'
import { ValidationProps } from './useSchema'

interface ValidateProps extends ValidationProps {
  value?: unknown
}

export const Validate = function Validate({ value, ...schemaDef }: ValidateProps) {
  const error = useError(value, schemaDef)
  const { showErrors } = useFormMetadata()
  return <ErrorMessage errors={showErrors ? error?.errors : null} />
}
