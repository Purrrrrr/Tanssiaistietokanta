import React from 'react'

import {useError} from './useError'
import {ValidationProps} from './useSchema'
import {ErrorMessage} from './ErrorMessage'

interface ValidateProps extends ValidationProps {
  value?: any 
}

export const Validate = function Validate({value, ...schemaDef} : ValidateProps) {
  return <ErrorMessage error={useError(value, schemaDef)} />
}
