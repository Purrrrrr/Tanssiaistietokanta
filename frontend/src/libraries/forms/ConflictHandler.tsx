import React from 'react'

import {Button, Flex} from 'libraries/ui'

import { ConflictData } from './types'

import {MenuButton} from './fieldComponents/Selector'
import {useFormStrings} from './formContext'

export function ConflictHandler({localValue, serverValue, onResolve}: ConflictData) {
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
