import { ComponentProps } from 'react'
import classNames from 'classnames'

import type { FieldInputComponent } from './types'

import { CssClass } from 'libraries/ui'

export type NumberInputExtraProps = Omit<ComponentProps<'input'>, 'type'>

export const NumberInput: FieldInputComponent<number, NumberInputExtraProps> = ({ value, onChange, className, inline = false, ...rest }) =>
  <input
    value={value ?? 0}
    className={classNames(className, CssClass.input, inline || 'w-full grow')}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(parseFloat(e.target.value))}
    {...rest}
    type="number"
  />

export default NumberInput
