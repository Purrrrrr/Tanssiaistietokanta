import React from 'react'

import {FormGroup} from 'libraries/ui'

import { LabelStyle, LabelTexts, Version } from './types'

import {ConflictHandler} from './ConflictHandler'
import type {Error} from './validation'
import {ErrorMessage} from './validation'


export interface FieldContainerProps extends LabelTexts, InternalFieldContainerProps {
  className?: string
  inline: boolean
  labelStyle: LabelStyle
  children?: React.ReactNode
  conflictData?: ConflictData
}

interface ConflictData {
  localValue: React.ReactNode
  serverValue: React.ReactNode
  onResolve(version: Version) : void
}

interface InternalFieldContainerProps {
  id: string
  error: Error | null
  errorId: string
}

export function FieldContainer(props: FieldContainerProps) {
  const {id, className, error, errorId, label, labelStyle, inline, labelInfo, helperText, children, conflictData} = props
  const formGroupId = `${id}--formgroup`

  const errorMsg = <ErrorMessage id={errorId} error={error} />
  const conflictComponent = conflictData ? <ConflictHandler {...conflictData} /> : null

  if (labelStyle === 'hidden-nowrapper') {
    return <React.Fragment>{conflictComponent}{children}{errorMsg}</React.Fragment>
  }
  if (labelStyle === 'hidden') {
    return inline
      ? <span id={formGroupId}>{conflictComponent}{children}{errorMsg}{helperText}</span>
      : <div id={formGroupId}>{conflictComponent}{children}{errorMsg}{helperText}</div>
  }
  const helperTextId = `${id}--helperText`

  return <FormGroup
    className={className}
    id={formGroupId}
    labelStyle={labelStyle}
    inline={inline}
    labelFor={id}
    labelInfo={labelInfo}
    helperText={<span id={helperTextId}>{helperText}</span>}
    label={label}
    subLabel={conflictComponent}
    intent={conflictData ? 'danger' : undefined}
  >
    {children}{errorMsg}
  </FormGroup>
}
