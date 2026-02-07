import classNames from 'classnames'

import { FieldInputComponent, FieldInputComponentProps } from './types'

import { CssClass } from 'libraries/ui'

export interface SwitchProps extends FieldInputComponentProps<boolean> {
  label: string
}

const Classes = {
  SWITCH: 'bp5-switch',
  INLINE: 'bp5-inline',
  CONTROL_INDICATOR: 'bp5-switch-indicator',
}

export const Switch: FieldInputComponent<boolean, SwitchProps> = function Switch({ value, onChange, inline, readOnly: disabled, label, ...rest }: SwitchProps) {
  return <label
    className={classNames(
      Classes.SWITCH,
      CssClass.interactiveTrigger,
      inline && Classes.INLINE,
    )}
  >
    <input
      type="checkbox"
      disabled={disabled}
      checked={value ?? false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}

      {...rest}
    />
    <span className={Classes.CONTROL_INDICATOR + ' ' + CssClass.interactiveElement} />
    {label}
  </label>
}
