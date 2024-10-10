import { useContext } from 'react'

import {Button} from 'libraries/ui'

import { VersionSidebarProps } from './types'

import { VersionSidebarToggleContext } from './VersionableContentContainer'

interface VersionsButtonProps extends VersionSidebarProps {
}

export function VersionsButton(props: VersionsButtonProps) {
  const { toggleSidebar } = useContext(VersionSidebarToggleContext)
  return <Button
    icon="history"
    minimal
    style={{float: 'right'}}
    onClick={() => toggleSidebar(props)}>
    Muokkaushistoria
  </Button>
}
