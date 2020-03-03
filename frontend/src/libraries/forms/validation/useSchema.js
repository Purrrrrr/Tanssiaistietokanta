import {useMemo} from 'react';
import {useDeepCompareMemoize} from './utils/useDeepCompareMemoize'
import validators from './utils/yup';

export function useSchema(schema) {
  const normalizedSchema = useDeepCompareMemoize(normalize(schema));
  return useMemo(
    () => getSchema(normalizedSchema),
    [normalizedSchema]
  );
}

function normalize({type, required, min, minLength, max, maxLength, pattern}) {
  return {
    type: normalizeType(type), required,
    min: min ?? minLength,
    max: max ?? maxLength,
    matches: pattern,
    email: type === 'email' ? true : undefined
  };
}

function normalizeType(type) {
  switch(type) {
    case 'array':
    case 'list':
      return 'array';
    case 'number':
      return 'number';
    case 'text':
    default:
      return 'string';
  }
}

function getSchema({type, ...spec}) {
  let schema = validators[type]();
  let unvalidated = true;
  for(const [key, val] of Object.entries(spec)) {
    if (val === undefined) continue;
    if (!schema[key]) continue;
    unvalidated = false;
    if (noArguments[key]) {
      schema = schema[key]();
    } else {
      schema = schema[key](val);
    }
  }
  return unvalidated ? null : schema;
}

const noArguments = {
  required: true,
  email: true
};
