import { useContext, useEffect } from 'react'

import {Button} from 'libraries/ui'

import { VersionSidebarProps } from './types'

import { VersionSidebarToggleContext } from './VersionableContentContainer'

interface VersionsButtonProps extends VersionSidebarProps {
  id?: string
}

export function VersionsButton({id, versionId, entityId, entityType}: VersionsButtonProps) {
  const buttonId = id ?? `${entityType}-${entityId}`
  const { toggleSidebar, updateVersion } = useContext(VersionSidebarToggleContext)

  useEffect(
    () => {
      updateVersion({
        buttonId, entityId, versionId, entityType,
      })
    },
    [buttonId, entityId, versionId, entityType, updateVersion]
  )

  return <Button
    icon="history"
    minimal
    style={{float: 'right'}}
    onClick={() => toggleSidebar({ buttonId, entityId, versionId, entityType })}>
    Muokkaushistoria
  </Button>
}
