import React from 'react'
import classNames from 'classnames'

import { FieldInputComponentProps } from '@/libraries/ui/form/inputs/types'

import { CssClass } from '@/libraries/ui/classes'

type TextAreaInputProps = FieldInputComponentProps<string> & Omit<React.ComponentProps<'textarea'>, keyof FieldInputComponentProps<string>>

export default function TextAreaInput({ value, onChange, inline: _ignored, className, ...props }: TextAreaInputProps) {
  return <textarea
    value={value ?? ''}
    onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
    onChange={e => onChange?.(e.target.value)}
    {...props}
    className={classNames(
      className,
      'w-full min-h-24 p-2.5 resize-y',
      CssClass.inputBox,
    )}
  />
}
