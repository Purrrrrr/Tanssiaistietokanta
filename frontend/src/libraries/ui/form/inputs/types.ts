export type FieldInputComponent<
  Output extends Input,
  Extra = unknown,
  Input = Nullable<Output>,
> = React.FunctionComponent<FieldInputComponentProps<Output, Input> & Extra>

export interface FieldInputComponentProps<Output extends Input, Input = Nullable<Output>> {
  inline?: boolean
  readOnly?: boolean
  id?: string
  'aria-describedby'?: string
  'aria-label'?: string
  value: Input
  onChange: (value: Output) => unknown
}

export type Nullable<T> = T | null | undefined

export type FieldInputPropKeys = keyof FieldInputComponentProps<unknown, unknown>
export type OmitInputProps<Extra> = Omit<Extra, FieldInputPropKeys>
