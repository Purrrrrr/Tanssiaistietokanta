import React, { RefAttributes } from 'react'
import { Switch as BlueprintSwitch } from '@blueprintjs/core'

import { FieldInputComponent, FieldInputComponentProps } from './types'

export interface SwitchProps extends FieldInputComponentProps<boolean>, RefAttributes<HTMLInputElement> {
  label: string
}
export const Switch: FieldInputComponent<boolean, SwitchProps> = React.forwardRef<HTMLInputElement, Omit<SwitchProps, 'ref'>>(
  function Switch({ value, onChange, readOnly, ...props }, ref) {
    return <BlueprintSwitch
      inputRef={ref}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      disabled={readOnly}
      {...props}
    />
  },
)
