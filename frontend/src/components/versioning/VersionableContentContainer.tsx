import { createContext, useState } from 'react'
import deepEquals from 'fast-deep-equal'

import { VersionSidebarProps } from './types'

import VersionSidebar from './VersionSidebar'

type VersionSidebarToggleContext = {
  toggleSidebar: (props: VersionSidebarProps) => void
  hideSidebar: () => void
}

export const VersionSidebarToggleContext = createContext<VersionSidebarToggleContext>({
  toggleSidebar: () => {},
  hideSidebar: () => {}
})

export default function VersionableContentContainer({children}) {
  const [sidebarProps, setSidebarProps] = useState<VersionSidebarProps | null>(null)
  const context = {
    toggleSidebar: (props: VersionSidebarProps) => {
      //Acts as a toggle
      setSidebarProps(
        existing => deepEquals(existing, props) ? null : props
      )
    },
    hideSidebar: () => setSidebarProps(null)
  }

  return <VersionSidebarToggleContext.Provider value={context}>
    {children}
    {sidebarProps && <VersionSidebar {...sidebarProps} />}
  </VersionSidebarToggleContext.Provider>
}
