import { lazy } from 'react'

export { type DateInputProps } from './DateInput'
export { type DateRangeInputProps } from './DateRangeInput'
export { type DateTimeInputProps } from './DateTimeInput'
export { type MarkdownInputProps } from './MarkdownInput'
export { type SegmentedInputProps } from './SegmentedInput'
export {
  AutocompleteInput, type AutocompleteInputProps,
  filterItemList, Select, type SelectorProps, type SelectProps } from './selectors'
export { Switch, type SwitchProps } from './Switch'
export { type TextInputExtraProps } from './TextInput'
export type { FieldInputComponent, FieldInputComponentProps, Nullable, OmitInputProps } from './types'

export const DateInput = lazy(() => import('./DateInput'))
export const DateRangeInput = lazy(() => import('./DateRangeInput'))
export const DateTimeInput = lazy(() => import('./DateTimeInput'))
export const MarkdownInput = lazy(() => import('./MarkdownInput'))
export const NumberInput = lazy(() => import('./NumberInput'))
export const SegmentedInput = lazy(() => import('./SegmentedInput'))
export const TextInput = lazy(() => import('./TextInput'))
