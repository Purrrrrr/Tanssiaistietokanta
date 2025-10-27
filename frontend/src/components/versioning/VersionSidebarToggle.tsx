import { useContext, useEffect } from 'react'
import { History } from '@blueprintjs/icons'

import { VersionSidebarProps } from './types'

import { Button } from 'libraries/ui'
import { useTranslation } from 'i18n'

import { VersionSidebarToggleContext } from './VersionableContentContainer'

interface VersionsButtonProps extends Omit<VersionSidebarProps, 'onClose'> {
  id?: string
}

export function VersionSidebarToggle({ id, versionId, entityId, entityType, toVersionLink }: VersionsButtonProps) {
  const buttonId = id ?? `${entityType}-${entityId}`
  const { toggleSidebar, updateVersion } = useContext(VersionSidebarToggleContext)

  useEffect(
    () => {
      updateVersion({
        buttonId, entityId, versionId, entityType, toVersionLink,
      })
    },
    [buttonId, entityId, versionId, entityType, updateVersion, toVersionLink],
  )

  return <Button
    icon={<History />}
    minimal
    className="float-right"
    onClick={() => toggleSidebar({ buttonId, entityId, versionId, entityType, toVersionLink })}>
    {useTranslation('versioning.versionHistory')}
  </Button>
}
