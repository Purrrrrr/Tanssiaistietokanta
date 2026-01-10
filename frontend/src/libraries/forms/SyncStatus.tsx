import React from 'react'
import { Error, Outdated, Refresh, Saved } from 'libraries/ui/icons'
import classNames from 'classnames'

import { useDelayedValue } from 'libraries/common/useDelayedValue'

import { useFormStrings } from './formContext'
import { SyncState } from './useAutosavingState'

import './SyncStatus.sass'

const icons: Record<SyncState, React.ReactNode> = {
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
  const previousState = useDelayedValue(state, 1000)
  const shownState = useDelayedValue(state, 400) // Debounce a bit so people have time to see the changes
  const changed = state !== previousState
  const texts = useFormStrings().syncState
  const fullClassName = classNames(
    className, 'sync_status', shownState.toLowerCase(),
    { 'status-changed': changed, 'always-show-status': !autoHideText[shownState], 'display-block': block, right },
  )

  const style = {
    // Hold space for the longest text so the layout doesn't jump
    '--spaceholder': `"${getLongestText(Object.values(texts))}"`,
    ...styleProp,
  }
  return <span style={style} className={fullClassName}>
    <span className="content">
      {icons[shownState]}
      <span className="text">{texts[shownState]}</span>
    </span>
  </span>
}

function getLongestText(texts: string[]): string {
  return texts.reduce((a, b) => a.length > b.length ? a : b)
}
