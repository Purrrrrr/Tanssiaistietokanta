import { LabelProps } from '../types'

interface HiddenLabelProps extends LabelProps {
  labelFor: string
}

export function HiddenLabel({label, labelFor, labelInfo}: HiddenLabelProps) {
  return <label htmlFor={labelFor} className="sr-only">
    {label}
    {labelInfo ? ' ' : ''}
    {labelInfo}
  </label>
}
