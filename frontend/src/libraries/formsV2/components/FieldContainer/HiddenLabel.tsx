import { FieldContainerProps } from './types'

import './HiddenLabel.scss'

type HiddenLabelProps = Pick<FieldContainerProps, 'label' | 'labelInfo'> & {
  labelFor: string
}

export function HiddenLabel({label, labelFor, labelInfo}: HiddenLabelProps) {
  return <label htmlFor={labelFor} className="hidden-label">
    {label}{labelInfo ? ' ' : ''}{labelInfo}
  </label>
}
