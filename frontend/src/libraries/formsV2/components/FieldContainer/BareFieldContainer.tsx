import React from 'react'

import { BareFieldContainerProps } from './types'

import {ErrorMessage} from './ErrorMessage'
import { HiddenLabel } from './HiddenLabel'

export function BareFieldContainer(props: BareFieldContainerProps) {
  const {
    error, errorId, labelFor, label, labelInfo, helperText, children, conflictElement
  } = props

  const errorMsg = <ErrorMessage id={errorId} error={error} />

  return <React.Fragment>
    {label && <HiddenLabel labelFor={labelFor} label={label} labelInfo={labelInfo} />}
    {conflictElement}{children}{errorMsg}{helperText}
  </React.Fragment>
}
