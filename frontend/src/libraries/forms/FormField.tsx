import React from 'react';
import {useError, ErrorMessage, stripValidationProps, ValidationProps} from "./validation";
import { useAccessibleLabeling, LabelingProps } from './hooks/useAccessibleLabeling';

export type FieldProps<T> = ValidationProps & LabelingProps & T & {
  id?: string
  value?: any
};

export function asAccessibleField<T>(Component : React.JSXElementConstructor<T>) {
  return (props : FieldProps<T>) => {
    const {fieldProps, wrapField} = useAccessibleField(props);
    return wrapField(<Component {...fieldProps as T} />);
  }
}

type Wrapper = (nodes: JSX.Element) => JSX.Element;

export function useAccessibleField<T>(
  props : FieldProps<T>
) : {fieldProps: T, wrapField: Wrapper} {
  const {fieldProps, addLabel} = useAccessibleLabeling(props);
  const error = useError(props.value, props);
  const errorId = `${fieldProps.id}-error`;
  if (error) fieldProps['aria-describedby'] = errorId;

  const addValidation = (children : JSX.Element) => error ? <>{children}<ErrorMessage id={errorId} error={error} /></> : children;

  return {
    fieldProps: stripValidationProps(fieldProps),
    wrapField: (children : JSX.Element ) => addLabel(addValidation(children)),
  };
}
