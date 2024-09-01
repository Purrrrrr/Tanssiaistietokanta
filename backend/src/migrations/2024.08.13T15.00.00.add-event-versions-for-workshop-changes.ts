import { sortBy } from 'es-toolkit'

import { MigrationFn } from '../umzug.context';
import Nedb from '@seald-io/nedb';
import { CREATE_VERSION_AFTER_IDLE_TIME, MAX_VERSION_AGE } from '../utils/VersioningNeDBService';

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
        ...workshopVersions.map(({_updatedAt, _recordId, _id, eventId}) => ({
          type: 'workshop' as const,
          eventId,
          workshopId: _recordId,
          workshopVersionId: _id,
          updatedAt: +new Date(_updatedAt),
        })),
        ...workshopVersions.filter(w => w._recordDeletedAt).map(({_recordDeletedAt, _recordId, eventId}) => ({
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

  for (const versions of versionMap.values()) {
    const groups = groupIntoVersionGroups(versions)
    for (const group of groups) {
      const { eventVersionId, data, workshops: workshopVersions, updatedAt: _updatedAt } = group
      if (eventVersionId) {
        console.log(`Update ${group.eventId}`)
        await eventModel.updateAsync({ _id: eventVersionId }, { ...data, workshopVersions, _updatedAt })
      } else {
        console.log(`Create ${group.eventId}`)
        const { _id, ...rest } = data
        await eventModel.insertAsync({ ...rest, workshopVersions, _updatedAt })
      }
    }
  }


}

export const down: MigrationFn = async () => {};

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
  const groups : VersionGroup[] = []
  const firstEvent = items.find(i => i.type === 'event')
  if (!firstEvent) {
    //This should not happen, still somehow happens
    return [] 
  }
  let currentGroup: VersionGroup = group(items[0], firstEvent.event)
  // console.log(items[0].eventId)
  
  for (const item of items) {
    const createNewVersion = 
      item.updatedAt > currentGroup.updatedAt + CREATE_VERSION_AFTER_IDLE_TIME
      item.updatedAt > currentGroup.createdAt + MAX_VERSION_AGE
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

  return groups
}

function group(item: Item, event: Version, workshops?: Record<string, string>): VersionGroup {
  const { updatedAt, eventId} = item
  return {
    eventId,
    createdAt: updatedAt,
    updatedAt,
    workshops: { ...workshops } ?? {},
    data: event,
  }
}
