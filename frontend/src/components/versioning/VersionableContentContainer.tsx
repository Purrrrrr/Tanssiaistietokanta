import { createContext, useMemo, useState } from 'react'

import { VersionSidebarProps } from './types'

import VersionSidebar from './VersionSidebar'

interface VersionSidebarPropsAndId extends Omit<VersionSidebarProps, 'onClose'> {
  //The id of the button that opened the sidebar.
  //Only one button at a time opens the sidebar
  //and that button must supply the props to it;
  buttonId: string
}

interface VersionSidebarToggleContextType {
  toggleSidebar: (props: VersionSidebarPropsAndId) => void
  updateVersion: (props: VersionSidebarPropsAndId) => void
  hideSidebar: () => void
}

export const VersionSidebarToggleContext = createContext<VersionSidebarToggleContextType>({
  toggleSidebar: () => {},
  updateVersion: () => {},
  hideSidebar: () => {}
})

export default function VersionableContentContainer({children}) {
  const [sidebarProps, setSidebarProps] = useState<VersionSidebarPropsAndId | null>(null)

  const context = useMemo(() => ({
    toggleSidebar: (props: VersionSidebarPropsAndId) => {
      //Acts as a toggle
      setSidebarProps(
        existing => existing?.buttonId  === props.buttonId ? null : props
      )
    },
    updateVersion: (props: VersionSidebarPropsAndId) => {
      setSidebarProps(
        existing => existing?.buttonId === props.buttonId ? props : existing
      )
    },
    hideSidebar: () => setSidebarProps(null)
  }), [])

  return <VersionSidebarToggleContext.Provider value={context}>
    {children}
    {sidebarProps && <VersionSidebar onClose={context.hideSidebar} {...sidebarProps} />}
  </VersionSidebarToggleContext.Provider>
}
