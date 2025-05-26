import {ComponentProps} from 'react'
import {Classes} from '@blueprintjs/core'
import classNames from 'classnames'

import type { FieldInputComponent } from './types'

export type TextInputExtraProps = ComponentProps<'input'>

export const TextInput : FieldInputComponent<string, TextInputExtraProps> = ({value, onChange, className, inline, ...rest}) =>
  <input
    value={value ?? ''}
    className={classNames(className, Classes.INPUT, inline || Classes.FILL)}
    onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(e.target.value)}
    {...rest}
  />

export default TextInput
