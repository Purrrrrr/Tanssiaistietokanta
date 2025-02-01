import type { ComponentType } from 'react'

export type FieldInputComponent<Input, Output extends Input, Extra = unknown> = ComponentType<FieldInputComponentProps<Input, Output> & Extra>

export interface FieldInputComponentProps<Input, Output extends Input> {
  value: Input
  onChange: (value: Output) => unknown
}
