export type ChangeListener = () => unknown
export type NewValue<T> = T | ((t: T) => T)
export type OnChangeHandler<T> = (t: T) => unknown

export type ExtendedFieldComponentProps<T, Props> =
  FieldComponentProps<T>
  & Omit<Props, keyof FieldComponentProps<T>>

export interface FieldComponentProps<T> extends
  FieldComponentDisplayProps, FieldDataProps<T> { }

export interface FieldDataProps<T> {
  value: T | undefined | null
  onChange: OnChangeHandler<T>
}
export interface FieldComponentDisplayProps {
  inline?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
}
