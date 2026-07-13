import { useId } from 'react'

import { FormGroup } from 'libraries/ui'
import { CssClass } from 'libraries/ui/classes'

export { FloatingToolbar, ToolbarButton, ToolbarRow } from 'libraries/ui'

interface ToolbarInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string | number
  onChange: (value: string) => void
  label: string
}

export function ToolbarInput({ value, onChange, label, ...props }: ToolbarInputProps) {
  const id = useId()
  return <FormGroup inline label={label} labelFor={props.id ?? id}>
    <input
      id={id}
      className={CssClass.input}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </FormGroup>
}
