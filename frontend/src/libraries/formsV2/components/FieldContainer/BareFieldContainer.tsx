import { BareFieldContainerProps } from './types'

import { HiddenLabel } from './HiddenLabel'

export function BareFieldContainer(props: BareFieldContainerProps) {
  const {
    labelFor, label, labelInfo, helperText, children, conflictElement
  } = props

  return <>
    {label && <HiddenLabel labelFor={labelFor} label={label} labelInfo={labelInfo} />}
    {conflictElement}{children}{helperText}
  </>
}
