import type { ComponentType } from 'react'

export type FieldInputComponent<Output extends Input, Extra = unknown, Input = Nullable<Output>> = ComponentType<FieldInputComponentProps<Output, Input> & Omit<Extra, 'value' | 'onChange'>>

export interface FieldInputComponentProps<Output extends Input, Input = Nullable<Output>> {
  inline?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
  value: Input
  onChange: (value: Output) => unknown
}

export type Nullable<T> = T | null | undefined

export type OmitInputProps<Extra> = Omit<Extra, keyof FieldInputComponentProps<unknown, unknown>>
