import {ComponentProps} from 'react'
import {Classes} from '@blueprintjs/core'
import classNames from 'classnames'

import type { FieldInputComponent } from './types'

export const TextInput : FieldInputComponent<string | undefined | null, string, ComponentProps<'input'>> = ({value, onChange, className, ...rest}) =>
  <input
    value={value ?? ''}
    className={classNames(className, Classes.INPUT)}
    onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
    onChange={e => onChange(e.target.value)}
    {...rest}
  />
