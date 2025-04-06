import React, { RefAttributes } from 'react'
import { Switch as BlueprintSwitch } from '@blueprintjs/core'

import { FieldInputComponent, FieldInputComponentProps } from './types'

export interface SwitchInputProps extends FieldInputComponentProps<boolean>, RefAttributes<HTMLInputElement> {
  label: string
}
export const SwitchInput : FieldInputComponent<boolean, SwitchInputProps> = React.forwardRef<HTMLInputElement, Omit<SwitchInputProps, 'ref'>>(
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
