import classNames from 'classnames'

import { FieldInputComponent, FieldInputComponentProps } from './types'

export interface SwitchProps extends FieldInputComponentProps<boolean> {
  label: string
}

const Classes = {
  SWITCH: 'switch',
  CONTROL_INDICATOR: 'switch-indicator',
}

export const Switch: FieldInputComponent<boolean, SwitchProps> = function Switch({ value, onChange, inline, readOnly: disabled, label, ...rest }: SwitchProps) {
  return <label
    className={classNames(
      Classes.SWITCH,
      inline && 'inline-block mr-5',
    )}
  >
    <input
      type="checkbox"
      disabled={disabled}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}

      {...rest}
    />
    <span className={Classes.CONTROL_INDICATOR} />
    {label}
  </label>
}
