import React from 'react'

export type ChangeListener = () => unknown
export type NewValue<T> = T | ((t: T) => T)
export type OnChangeHandler<T> = (t: NewValue<T>) => unknown

export type ExtendedFieldComponentProps<T, EventElement, Props> =
  FieldComponentProps<T, EventElement>
  & Omit<Props, keyof FieldComponentProps<T, EventElement>>

export interface FieldComponentProps<T, EventElement = HTMLElement> extends FieldComponentPropsWithoutEvent<T> {
  onChange: (t: NewValue<T>, e?: React.ChangeEvent<EventElement>) => unknown
}
export interface FieldComponentPropsWithoutEvent<T> extends FieldComponentDisplayProps, FieldDataProps<T> { }

export interface FieldDataProps<T> {
  value: T | undefined | null
  onChange: OnChangeHandler<T>
  hasConflict?: boolean
}
export interface FieldComponentDisplayProps {
  inline?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
}
