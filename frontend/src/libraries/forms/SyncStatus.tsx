import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Error, Outdated, Refresh, Saved } from '@blueprintjs/icons'
import classNames from 'classnames'

import { useFormStrings } from './formContext'
import { SyncState } from './useAutosavingState'

import './SyncStatus.sass'

const icons: Record<SyncState, ReactNode> = {
  IN_SYNC: <Saved className="text-lime-700" />,
  MODIFIED_LOCALLY: <Refresh className="text-sky-600" />,
  CONFLICT: <Outdated className="text-yellow-700" />,
  INVALID: <Error className="text-red-700" />,
}
const autoHideText: Record<SyncState, boolean> = {
  IN_SYNC: true,
  MODIFIED_LOCALLY: true,
  CONFLICT: false,
  INVALID: false,
}

export function SyncStatus(
  { state, block, className, style: styleProp, floatRight: right }:
  { state: SyncState, block?: boolean, className?: string, style?: React.CSSProperties, floatRight?: boolean },
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
    { 'status-changed': changed, 'always-show-status': !autoHideText[state], 'display-block': block, right },
  )

  const style = {
    // Hold space for the longest text so the layout doesn't jump
    '--spaceholder': `"${getLongestText(Object.values(texts))}"`,
    ...styleProp,
  }
  return <span style={style} className={fullClassName}>
    <span className="content">
      {icons[state]}
      <span className="text">{texts[state]}</span>
    </span>
  </span>
}

function getLongestText(texts: string[]): string {
  return texts.reduce((a, b) => a.length > b.length ? a : b)
}
