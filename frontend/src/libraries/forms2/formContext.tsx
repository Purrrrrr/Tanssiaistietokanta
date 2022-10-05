import React, { useContext } from 'react';
import {Path} from './types'

export interface FormValueContextType<T> {
  value: T
  onChange: (t: T) => unknown
  conflicts: Path<T>[]
  formIsValid: boolean
}
export interface FormMetadataContextType {
  readOnly: boolean
  labelStyle: LabelStyle
}
export type LabelStyle = 'inline' | 'inline-fill' | 'above' | 'hidden';

export const FormValueContext = React.createContext<FormValueContextType<unknown>|null>(null)
export const FormMetadataContext = React.createContext<FormMetadataContextType|null>(null)

export function useFormMetadata() {
  return useContext(FormMetadataContext)
}
