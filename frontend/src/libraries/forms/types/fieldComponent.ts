import type {ChangeEvent} from 'react'

export type ChangeListener = () => unknown
export type NewValue<T> = T | ((t: T) => T)
export type OnChangeHandler<T, EventElement = never> = (t: NewValue<T>, event?: ChangeEvent<EventElement>) => unknown

export type ExtendedFieldComponentProps<T, EventElement, Props> =
  FieldComponentProps<T, EventElement>
  & Omit<Props, keyof FieldComponentProps<T, EventElement>>

export interface FieldComponentProps<T, EventElement = never> extends
  FieldComponentDisplayProps, FieldDataProps<T, EventElement> { }

export interface FieldDataProps<T, EventElement = never> {
  value: T | undefined | null
  onChange: OnChangeHandler<T, EventElement>
}
export interface FieldComponentDisplayProps {
  inline?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
}
