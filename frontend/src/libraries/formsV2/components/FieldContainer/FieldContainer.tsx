import React from 'react'

import {FormGroup} from 'libraries/ui'

import { FieldContainerProps } from './types'

import { useFieldStyle } from './context'
import {ErrorMessage} from './ErrorMessage'

export function FieldContainer(props: FieldContainerProps) {
  const {
    id, containerClassName, error, errorId, label, labelInfo, helperText, children, conflictElement
  } = props
  const { inline, labelStyle } = useFieldStyle(props)
  const formGroupId = `${id}--formgroup`

  const errorMsg = <ErrorMessage id={errorId} error={error} />

  if (labelStyle === 'hidden-nowrapper') {
    return <React.Fragment>{conflictElement}{children}{errorMsg}</React.Fragment>
  }
  if (labelStyle === 'hidden') {
    return inline
      ? <span id={formGroupId}>{conflictElement}{children}{errorMsg}{helperText}</span>
      : <div id={formGroupId}>{conflictElement}{children}{errorMsg}{helperText}</div>
  }
  const helperTextId = `${id}--helperText`

  return <FormGroup
    className={containerClassName}
    id={formGroupId}
    labelStyle={labelStyle}
    inline={inline}
    labelFor={id}
    labelInfo={labelInfo}
    helperText={<span id={helperTextId}>{helperText}</span>}
    label={label}
    subLabel={conflictElement}
    intent={conflictElement !== undefined ? 'danger' : undefined}
  >
    {children}{errorMsg}
  </FormGroup>
}
