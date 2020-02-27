import React, {useEffect, useState} from 'react';

import {useUpdateErrorContext} from './context';
import {useSchema} from './schema';
import {ErrorMessage} from './ErrorMessage';

export function Validate({value, children, ...schemaDef}) {
  const error = useError(value, schemaDef);
  return error ?  <ErrorMessage message={error.errors.join(', ')} /> : null;
}

export function useError(value, schemaDef) {
  const schema = useSchema(schemaDef);
	const [error, setError] = useState();
	useEffect(
    () => {
      schema.validate(value)
        .then(() => setError(null)).catch(setError);
    },
		[value, schema, setError]
  );
  useUpdateErrorContext(error);
  return error;
}
