import React from 'react'
import { Switch as BlueprintSwitch } from '@blueprintjs/core'

import { FieldInputComponentProps } from './types'

interface SwitchProps extends FieldInputComponentProps<boolean | null | undefined, boolean> {
  label: string
}
export const SwitchInput = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ value, onChange, readOnly, ...props }, ref) {
    return <BlueprintSwitch
      inputRef={ref}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      disabled={readOnly}
      {...props}
    />
  }
)
