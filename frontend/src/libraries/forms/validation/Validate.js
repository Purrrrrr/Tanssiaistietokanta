import React from 'react';

import {useError} from './useError';
import {ErrorMessage} from './ErrorMessage';

export const Validate = function Validate({value, ...schemaDef}) {
  return <ErrorMessage error={useError(value, schemaDef)} />;
};
