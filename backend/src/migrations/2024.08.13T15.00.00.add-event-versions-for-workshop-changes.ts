import { sortBy, isEqual } from 'es-toolkit'

import { MigrationFn } from '../umzug.context'
import Nedb from '@seald-io/nedb'
import { CREATE_VERSION_AFTER_IDLE_TIME, MAX_VERSION_AGE } from '../utils/VersioningNeDBService'

interface Version extends Record<string, unknown> {
  _id: string
  _recordId: string
  _updatedAt: string
}
interface WorkshopVersion extends Version {
  eventId: string
  _recordDeletedAt?: string
}

export const up: MigrationFn = async params => {
  const { context } = params
  const eventModel = context.getModel('events')
  const eventVersionModel = context.getVersionModel('events') as Nedb<Version>
  const workshopVersionModel = context.getVersionModel('workshops') as Nedb<WorkshopVersion>

  const eventVersions = await eventVersionModel.findAsync({})
  const workshopVersions = await workshopVersionModel.findAsync({})

  const versionMap = Map.groupBy(
    sortBy(
      [
        ...eventVersions.map(e => ({
          type: 'event' as const,
          eventId: e._recordId,
          eventVersionId: e._id,
          updatedAt: +new Date(e._updatedAt),
          event: e,
        })),
        ...workshopVersions.map(({ _updatedAt, _recordId, _id, eventId }) => ({
          type: 'workshop' as const,
          eventId,
          workshopId: _recordId,
          workshopVersionId: _id,
          updatedAt: +new Date(_updatedAt),
        })),
        ...workshopVersions.filter(w => w._recordDeletedAt).map(({ _recordDeletedAt, _recordId, eventId }) => ({
          type: 'workshop' as const,
          eventId,
          workshopId: _recordId,
          workshopVersionId: null,
          updatedAt: +new Date(_recordDeletedAt as string),
        })),
      ] satisfies Item[],
      ['updatedAt', 'type'],
    ),
    i => i.eventId,
  )

  for (const [eventId, versions] of versionMap.entries()) {
    const groups = groupIntoVersionGroups(versions)
    // Check for equality of workshopVersions across changes as a sanity check
    let lastVersions = {}
    let lastData = null
    for (const group of groups) {
      const { eventVersionId, data, workshops: workshopVersions, updatedAt } = group
      const _updatedAt = new Date(updatedAt).toISOString()
      const versionsEqual = isEqual(lastVersions, workshopVersions)
      const dataEqual = isEqual(lastData, data)
      if (eventVersionId) {
        console.log(`Update ${group.eventId} data ${dataEqual ? 'SAME' : 'UPDATED'} workshops ${versionsEqual ? 'SAME' : 'UPDATED'}`)
        await eventVersionModel.updateAsync({ _id: eventVersionId }, { ...data, workshopVersions, _updatedAt })
      } else {
        console.log(`Create ${group.eventId} data ${dataEqual ? 'SAME' : 'UPDATED'} workshops ${versionsEqual ? 'SAME' : 'UPDATED'}`)
        const { _id, ...rest } = data
        await eventVersionModel.insertAsync({ ...rest, workshopVersions, _updatedAt } as unknown as Version)
      }
      lastVersions = workshopVersions
      lastData = data
    }
    const lastWorkshopVersions = groups.at(-1)?.workshops
    await eventModel.updateAsync({ _id: eventId }, { $set: { workshopVersions: lastWorkshopVersions } })
  }
}

export const down: MigrationFn = async () => {}

type Item = {
  type: 'event'
  eventId: string
  eventVersionId: string
  updatedAt: number
  event: Version
} | {
  type: 'workshop'
  eventId: string
  workshopId: string
  workshopVersionId: string | null
  updatedAt: number
  recordDeletedAt?: string
}

interface VersionGroup {
  eventId: string
  eventVersionId?: string
  data: Version
  createdAt: number
  updatedAt: number
  workshops: Record<string, string>
}

function groupIntoVersionGroups(items: Item[]): VersionGroup[] {
  const groups: VersionGroup[] = []
  const firstEvent = items.find(i => i.type === 'event')
  if (!firstEvent) {
    // This should not happen, still somehow happens
    return []
  }
  let currentGroup: VersionGroup = group(items[0], firstEvent.event)
  // console.log(items[0].eventId)

  for (const item of items) {
    const createNewVersion =
      item.updatedAt > currentGroup.updatedAt + CREATE_VERSION_AFTER_IDLE_TIME
      || item.updatedAt > currentGroup.createdAt + MAX_VERSION_AGE
    if (createNewVersion || (currentGroup.eventVersionId && item.type === 'event')) {
      groups.push(currentGroup)
      const data = item.type === 'event' ? item.event : currentGroup.data
      currentGroup = group(item, data, currentGroup.workshops)
    }
    if (item.type === 'event') {
      currentGroup.eventVersionId = item.eventVersionId
    } else {
      if (item.workshopVersionId !== null) {
        // console.log(`workshop ${item.workshopId} = ${item.workshopVersionId}`)
        currentGroup.workshops[item.workshopId] = item.workshopVersionId
      } else {
        // console.log(`workshop ${item.workshopId} = null !`)
        delete currentGroup.workshops[item.workshopId]
      }
    }
  }
  groups.push(currentGroup)

  return groups
}

function group(item: Item, event: Version, workshops?: Record<string, string>): VersionGroup {
  const { updatedAt, eventId } = item
  return {
    eventId,
    createdAt: updatedAt,
    updatedAt,
    workshops: workshops ? { ...workshops } : {},
    data: event,
  }
}
