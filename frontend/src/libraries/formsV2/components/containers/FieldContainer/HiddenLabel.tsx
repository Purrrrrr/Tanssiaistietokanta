import { LabelProps } from '../types'

import './HiddenLabel.scss'

interface HiddenLabelProps extends LabelProps {
  labelFor: string
}

export function HiddenLabel({label, labelFor, labelInfo}: HiddenLabelProps) {
  return <label htmlFor={labelFor} className="hidden-label">
    {label}{labelInfo ? ' ' : ''}{labelInfo}
  </label>
}
