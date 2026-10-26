import React from 'react'

import { LabelTexts, Version } from './types'
import type { LabelStyle } from '@/libraries/ui/form/containers/types'

import { FormGroup } from '@/libraries/ui/form/containers/FormGroup'
import { type Errors } from '@/libraries/ui/form/ErrorMessage'

import { ErrorStateContainer } from '../ui/form/containers/ErrorStateContainer'
import { ConflictHandler } from './ConflictHandler'

export interface FieldContainerProps extends LabelTexts, InternalFieldContainerProps {
  className?: string
  inline?: boolean
  labelStyle?: LabelStyle | 'hidden-nowrapper'
  children?: React.ReactNode
  conflictData?: ConflictData
}

interface ConflictData {
  localValue: React.ReactNode
  serverValue: React.ReactNode
  onResolve(version: Version): void
}

interface InternalFieldContainerProps {
  id: string
  error: { errors: Errors } | null
  errorId: string
}

export function FieldContainer(props: FieldContainerProps) {
  const { id, error, children, labelStyle, conflictData, ...rest } = props
  const formGroupId = `${id}--formgroup`

  const conflictComponent = conflictData ? <ConflictHandler {...conflictData} /> : null

  if (labelStyle === 'hidden-nowrapper') {
    return <ErrorStateContainer errors={error?.errors} errorId={rest.errorId} conflictElement={conflictComponent}>
      {children}
    </ErrorStateContainer>
  }

  return <FormGroup
    id={formGroupId}
    labelFor={id}
    errors={error?.errors}
    conflictElement={conflictComponent}
    labelStyle={labelStyle}
    {...rest}
  >
    {children}
  </FormGroup>
}
