import React from 'react'

import type { ID, VersionCalendar, VersionSidebarProps  } from './types'

import { useDanceVersions } from 'services/dances'
import { useEventVersions } from 'services/events'

import VersionChooser from './VersionChooser'

const providers = {
  event: EventVersionsProvider,
  dance: DanceVersionsProvider,
}

export default function VersionSidebar({onClose, entityType, entityId: id, versionId, toVersionLink}: VersionSidebarProps) {
  const Provider = providers[entityType]

  return <Provider id={id}>
    {(name, versions) => <VersionChooser onClose={onClose} name={name} entityId={id} versionId={versionId} versions={versions} toVersionLink={toVersionLink} />}
  </Provider>
}

interface VersionProviderProps {
  id: ID
  children: (entityName: string, versions: VersionCalendar) => React.ReactNode
}

function EventVersionsProvider({id, children}: VersionProviderProps) {
  const event = useEventVersions({id})?.data?.event
  if (!event) return null

  return children(event.name, event?.versionHistory?.calendar)
}

function DanceVersionsProvider({id, children}: VersionProviderProps) {
  const dance = useDanceVersions({id})?.data?.dance
  if (!dance) return null

  return children(dance.name, dance?.versionHistory?.calendar)
}
