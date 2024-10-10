import type { ID } from 'backend/types'

export type { ID }

export interface VersionSidebarProps {
  entityType: 'event' | 'dance'
  entityId: ID
  versionId?: ID
}

export type VersionCalendar = {
  date: string
  versions: Version[]
}[]

export interface Version {
  _versionId: string
  _versionNumber: number
  _updatedAt: string,
}
