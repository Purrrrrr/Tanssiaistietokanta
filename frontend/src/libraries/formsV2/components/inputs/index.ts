import { lazy } from 'react'

export { type SegmentedInputProps } from './SegmentedInput'
export {
  AutocompleteInput,
  type AutocompleteInputProps,
  Select,
  type SelectorProps,
  type SelectProps,
} from './selectors'
export type { FieldInputComponent, FieldInputComponentProps, Nullable, OmitInputProps } from './types'
export { type DateInputProps } from '@/libraries/ui/form/inputs/DateInput'
export { type DateRangeInputProps } from '@/libraries/ui/form/inputs/DateRangeInput'
export { type DateTimeInputProps } from '@/libraries/ui/form/inputs/DateTimeInput'
export { default as Switch, type SwitchInputProps as SwitchProps } from '@/libraries/ui/form/inputs/SwitchInput'
export { type TextInputExtraProps } from '@/libraries/ui/form/inputs/TextInput'

export const DateInput = lazy(() => import('@/libraries/ui/form/inputs/DateInput'))
export const DateRangeInput = lazy(() => import('@/libraries/ui/form/inputs/DateRangeInput'))
export const DateTimeInput = lazy(() => import('@/libraries/ui/form/inputs/DateTimeInput'))
export const NumberInput = lazy(() => import('@/libraries/ui/form/inputs/NumberInput'))
export const SegmentedInput = lazy(() => import('./SegmentedInput'))
export const TextInput = lazy(() => import('@/libraries/ui/form/inputs/TextInput'))
