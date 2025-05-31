import React, {useEffect, useRef, useState} from 'react'
import classNames from 'classnames'

import {Icon, IconName, Intent} from 'libraries/ui'

import { useFormStrings } from './formContext'
import { formStringDefaults } from './strings'
import {SyncState} from './useAutosavingState'

import './SyncStatus.sass'

const icons : Record<SyncState, IconName> = {
  IN_SYNC: 'saved',
  MODIFIED_LOCALLY: 'refresh',
  CONFLICT: 'outdated',
  INVALID: 'error',
}
const iconIntents : Record<SyncState, Intent> = {
  IN_SYNC: 'success',
  MODIFIED_LOCALLY: 'primary',
  CONFLICT: 'warning',
  INVALID: 'danger',
}
const autoHideText: Record<SyncState, boolean> = {
  IN_SYNC: true,
  MODIFIED_LOCALLY: true,
  CONFLICT: false,
  INVALID: false,
}

export function SyncStatus(
  {state, block, className, style: styleProp, floatRight: right}:
  {state : SyncState, block?: boolean, className?: string, style?: React.CSSProperties, floatRight?: boolean }
) {
  const previousState = useRef<SyncState | null>(null)
  const [changed, setChanged] = useState(false)
  const texts = useFormStrings().syncState
  useEffect(() => {
    if (previousState.current !== state && previousState.current !== null) {
      setChanged(true)
    }
    previousState.current = state

    const id = setTimeout(() => {
      setChanged(false)
    }, 1000)
    return () => clearTimeout(id)
  }, [state])
  const fullClassName = classNames(
    className, 'sync_status', state.toLowerCase(),
    {'status-changed': changed, 'always-show-status': !autoHideText[state], block, right}
  )

  const style = {
    // Hold space for the longest text so the layout doesn't jump
    '--spaceholder': `"${getLongestText(Object.values(texts))}"`,
    ...styleProp
  }

  return <span style={style} className={fullClassName}>
    <span className="content">
      <Icon icon={icons[state]} intent={iconIntents[state]} />
      <span className="text">{texts[state]}</span>
    </span>
  </span>
}

function getLongestText(texts: string[]): string {
  return texts.reduce((a, b) => a.length > b.length ? a : b)
}
