import { FieldInputComponent, FieldInputComponentProps, Nullable } from '@/libraries/ui/form/inputs/types'

export function asNonNullableInput<Output extends Input, Extra, Input = Nullable<Output>>(
  InputComponent: FieldInputComponent<Output, Extra, Input>,
): FieldInputComponent<Exclude<Output, null | undefined>, Extra, Input> {
  return props => {
    const { value, onChange, ...rest } = props

    return <InputComponent
      {...rest as FieldInputComponentProps<Output, Input> & Extra}
      value={value}
      onChange={(changed) => {
        if (changed !== null && changed !== undefined) {
          onChange(changed as Exclude<Output, null | undefined>)
        }
      }}
    />
  }
}
