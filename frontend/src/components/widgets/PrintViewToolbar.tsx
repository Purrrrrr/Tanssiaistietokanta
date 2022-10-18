import React, {useState} from 'react'
import {Icon, IconName} from 'libraries/ui'
import './PrintViewToolbar.sass'

interface PrintViewToolbarProps {
  children: React.ReactNode,
  icon?: IconName,
  maxHeight?: number
}

export default function PrintViewToolbar({children, icon = 'settings', maxHeight} : PrintViewToolbarProps) {
  const [isOpen, setOpen] = useState(true)

  return <div className={'print-view-toolbar ' + (isOpen ? 'open' : 'closed')}
    style={isOpen && maxHeight ? {maxHeight} : undefined}
  >
    <Icon className="more" icon={icon} iconSize={20}
      /* //Ignore error about tabIndex since it's a bug in the type definitions
      // @ts-ignore */
      tabIndex={0}
      onFocus={() => setOpen(true)}
    />
    <div className="contents"
      style={maxHeight ? {maxHeight} : undefined}
    >
      {children}
    </div>
    <Icon className="close" icon="double-chevron-up" iconSize={20}
      onClick={() => setOpen(false)}
    />
  </div>
}
