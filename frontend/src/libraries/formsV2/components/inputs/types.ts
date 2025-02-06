import type { ComponentType } from 'react'

export type FieldInputComponent<Input, Output extends Input, Extra = unknown> = ComponentType<FieldInputComponentProps<Input, Output> & Extra>

export interface FieldInputComponentProps<Input, Output extends Input> {
  inline?: boolean
  readOnly?: boolean
  id: string
  'aria-describedby'?: string
  'aria-label'?: string
  value: Input
  onChange: (value: Output) => unknown
}

export type OmitInputProps<Extra extends object> = Omit<Extra, keyof FieldInputComponentProps<unknown, unknown>>
