import type { ReactNode } from 'react'
import classNames from 'classnames'

import { CommonContainerProps } from '../types'

import { useFieldStyle } from '../context'

import './Fieldset.scss'

interface FieldsetProps extends CommonContainerProps {
  className?: string
  children: ReactNode
}

export function Fieldset({ inline: inlineProp, labelStyle: labelStyleProp, className: cN, label, labelInfo, children }: FieldsetProps) {
  const { labelStyle, inline } = useFieldStyle({ inline: inlineProp, labelStyle: labelStyleProp })
  const className = classNames(
    cN,
    'form-fieldset bp5-form-group',
    labelStyle === 'beside' && 'label-beside',
    { inline },
  )
  return <fieldset className={className}>
    {label &&
      <legend className="bp5-label">
        {label}
        {labelInfo ? ' ' : ''}
        {labelInfo}
      </legend>
    }
    {children}
  </fieldset>
}
