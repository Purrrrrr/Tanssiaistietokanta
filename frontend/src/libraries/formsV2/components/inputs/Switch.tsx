import classNames from 'classnames'

import { FieldInputComponent, FieldInputComponentProps } from './types'

export interface SwitchProps extends FieldInputComponentProps<boolean> {
  label: string
}

const Classes = {
  CONTROL: 'bp5-control',
  SWITCH: 'bp5-switch',
  DISABLED: 'bp5-disabled',
  INLINE: 'bp5-inline',
  CONTROL_INDICATOR: 'bp5-control-indicator',
}

export const Switch: FieldInputComponent<boolean, SwitchProps> = function Switch({ value, onChange, inline, readOnly: disabled, label, ...rest }: SwitchProps) {
  return <label
    className={classNames(
      Classes.CONTROL,
      Classes.SWITCH,
      {
        [Classes.DISABLED]: disabled,
        [Classes.INLINE]: inline,
      },
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
