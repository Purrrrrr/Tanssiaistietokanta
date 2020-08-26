import {useMemo} from 'react';
import {useDeepCompareMemoize} from './utils/useDeepCompareMemoize'
import validators from './utils/yup';

export interface ValidationProps {
  type?: any,
  required?: any,
  min?: any,
  minLength?: any,
  max?: any,
  maxLength?: any,
  pattern?: any,
  errorMessages?: any,
  validate?: any,
}

export function useSchema(schema) {
  const normalizedSchema = useDeepCompareMemoize(normalize(schema));
  return useMemo(
    () => getSchema(normalizedSchema),
    [normalizedSchema]
  );
}

export function stripValidationProps<P>(props : P) : Omit<P, "validate" | "errorMessages"> {
  const ret = {...props}
  if ("validate" in ret) delete ret["validate"];
  if ("errorMessages" in ret) delete ret["errorMessages"];
  return ret;
}

function normalize({type, required, min, minLength, max, maxLength, pattern, errorMessages, validate}) {
  return {
    type: normalizeType(type),
    required,
    min: min ?? minLength,
    max: max ?? maxLength,
    matches: pattern,
    email: type === 'email' ? true : undefined,
    errorMessages: errorMessages ?? {},
    ...validate
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

function getSchema({type, errorMessages, ...spec}) {
  let schema = validators[type]();
  let unvalidated = true;
  for(const [key, val] of Object.entries(spec)) {
    if (val === undefined) continue;
    if (!schema[key]) continue;
    unvalidated = false;

    const args = noArguments[key] ? [] : [val];
    const message = errorMessages[key];
    if (message) {
      args.push(message);
    }
    schema = schema[key](...args);
  }
  return unvalidated ? null : schema;
}

const noArguments = {
  required: true,
  email: true
};
