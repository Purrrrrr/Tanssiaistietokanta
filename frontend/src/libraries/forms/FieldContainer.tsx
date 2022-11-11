import React from 'react'

import {FormGroup} from 'libraries/ui'

import { LabelStyle } from './types'

import {Error, ErrorMessage} from './validation'


export interface UserGivenFieldContainerProps extends Partial<ExternalFieldContainerProps> {
  label: string
}

export interface FieldContainerProps extends ExternalFieldContainerProps, InternalFieldContainerProps {
  children?: React.ReactNode
}

export interface ExternalFieldContainerProps {
  helperText?: string
  inline: boolean
  label: string
  labelInfo?: string
  labelStyle: LabelStyle
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

