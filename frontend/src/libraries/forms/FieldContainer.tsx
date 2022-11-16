import React from 'react'

import {FormGroup} from 'libraries/ui'

import { LabelStyle, LabelTexts } from './types'

import {Error, ErrorMessage} from './validation'


export interface FieldContainerProps extends LabelTexts, InternalFieldContainerProps {
  inline: boolean
  labelStyle: LabelStyle
  children?: React.ReactNode
}

interface InternalFieldContainerProps {
  id: string
  error: Error | null
  errorId: string
}

export function FieldContainer(props: FieldContainerProps) {
  const {id, error, errorId, label, labelStyle, inline, labelInfo, helperText, children} = props
  const formGroupId = `${id}--formgroup`

  const errorMsg = <ErrorMessage id={errorId} error={error} />
  if (labelStyle === 'hidden-nowrapper') {
    return <React.Fragment>{children}{errorMsg}</React.Fragment>
  }
  if (labelStyle === 'hidden') {
    return inline
      ? <span id={formGroupId}>{children}{errorMsg}{helperText}</span>
      : <div id={formGroupId}>{children}{errorMsg}{helperText}</div>
  }

  return <FormGroup
    id={formGroupId}
    labelStyle={labelStyle}
    inline={inline}
    labelFor={id}
    labelInfo={labelInfo}
    helperText={helperText}
    label={label}
  >
    {children}{errorMsg}
  </FormGroup>
}

