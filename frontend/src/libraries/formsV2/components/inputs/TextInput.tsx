import { ComponentProps } from 'react'
import classNames from 'classnames'

import type { FieldInputComponent } from './types'

import { CssClass } from 'libraries/ui'

export type TextInputExtraProps = ComponentProps<'input'>

const TextInput: FieldInputComponent<string, TextInputExtraProps> = ({ value, onChange, className, inline = false, ...rest }) =>
  <input
    value={value ?? ''}
    className={classNames(className, CssClass.input, inline || 'w-full grow')}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(e.target.value)}
    {...rest}
  />

export default TextInput
