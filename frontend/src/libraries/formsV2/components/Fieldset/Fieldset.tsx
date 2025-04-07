import type { ReactNode } from 'react'
import classNames from 'classnames'

import { useFieldStyle } from '../FieldContainer/context'

import './Fieldset.scss'

interface FieldsetProps {
  label?: string
  children: ReactNode
}

export function Fieldset({ label, children }: FieldsetProps) {
  const { labelStyle, inline } = useFieldStyle({})
  const className = classNames(
    'form-fieldset bp5-form-group',
    labelStyle === 'beside' && 'label-beside',
    { inline }
  )
  return <fieldset className={className}>
    {label && <legend className="bp5-label">{label}</legend>}
    {children}
  </fieldset>
}
