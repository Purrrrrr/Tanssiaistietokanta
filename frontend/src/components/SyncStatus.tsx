import React, {useRef, useState, useEffect} from 'react'
import classNames from 'classnames'
import {Icon, IconName, Intent} from 'libraries/ui'
import {SyncState} from 'utils/useAutosavingState'

import './SyncStatus.sass'

const icons : Record<SyncState, IconName> = {
  IN_SYNC: 'saved',
  MODIFIED_LOCALLY: 'refresh',
  CONFLICT: 'outdated',
}
const iconIntents : Record<SyncState, Intent> = {
  IN_SYNC: 'success',
  MODIFIED_LOCALLY: 'primary',
  CONFLICT: 'warning',
}
const texts : Record<SyncState, string> = {
  IN_SYNC: 'Tallennettu',
  MODIFIED_LOCALLY: 'Tallennetaan...',
  CONFLICT: 'Synkronointivirhe',
}

export default function SyncStatus({state, block, className, style} : { state : SyncState, block?: boolean, className?: string, style?: React.CSSProperties }) {
  const previousState = useRef<SyncState | null>(null)
  const [changed, setChanged] = useState(false)
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

  return <span
    style={style}
    className={classNames(className, 'sync_status', state.toLowerCase(), {'status-changed': changed, block})}
  >
    <Icon icon={icons[state]} intent={iconIntents[state]} />
    <span className="text">{texts[state]}</span>
  </span>
}

