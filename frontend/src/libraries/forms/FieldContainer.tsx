import React from 'react'

import {Button, FormGroup} from 'libraries/ui'

import { LabelStyle, LabelTexts, Version } from './types'

import {Flex} from '../../components/Flex'
import {MenuButton} from './fieldComponents/Selector'
import {useFormStrings} from './formContext'
import {Error, ErrorMessage} from './validation'


export interface FieldContainerProps extends LabelTexts, InternalFieldContainerProps {
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
  const {id, error, errorId, label, labelStyle, inline, labelInfo, helperText, children, conflictData} = props
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

  return <FormGroup
    id={formGroupId}
    labelStyle={labelStyle}
    inline={inline}
    labelFor={id}
    labelInfo={labelInfo}
    helperText={helperText}
    label={label}
    subLabel={conflictComponent}
    intent={conflictData ? 'danger' : undefined}
  >
    {children}{errorMsg}
  </FormGroup>
}

function ConflictHandler({localValue, serverValue, onResolve}: ConflictData) {
  const strings = useFormStrings()
  return <>
    {strings.hasConflicts}{' '}
    <MenuButton
      menu={
        <Flex spaced style={{padding: '1em'}}>
          <div>
            {strings.server}
            {serverValue}
            <Button intent="primary" text={strings.chooseThis} onClick={() => onResolve('SERVER')} />
          </div>
          <div>
            {strings.local}
            {localValue}
            <Button intent="primary" text={strings.chooseThis} onClick={() => onResolve('LOCAL')} />
          </div>
        </Flex>
      }
      text={strings.conflictButton}
      buttonProps={{
        rightIcon: 'caret-down',
        outlined: true,
        small: true,
        intent: 'danger',
      }}
    />
  </>
}
