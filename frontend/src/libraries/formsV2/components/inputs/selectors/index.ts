import { lazy } from 'react'

export { type AutocompleteInputProps } from './AutocompleteInput'
export { Select, type SelectProps } from './Select'
export type { SelectorProps } from './types'

export const AutocompleteInput = lazy(() => import('./AutocompleteInput'))
export const AutocompleteMultipleInput = lazy(() => import('./AutocompleteMultipleInput'))
