import { sortBy } from 'es-toolkit'
import Nedb from '@seald-io/nedb'

import { MigrationFn } from '../umzug.context'
import { CREATE_VERSION_AFTER_IDLE_TIME, MAX_VERSION_AGE } from '../utils/VersioningNeDBService'

// ---- Shared types ----

interface AnyVersion extends Record<string, unknown> {
  _id: string
  _recordId: string
  _updatedAt: string
  _versionCreatedAt: string
  _versionNumber: number
  _recordDeletedAt?: string
}

interface WorkshopVersion extends AnyVersion {
  eventId: string
}

interface VolunteerVersion extends AnyVersion {
  eventId: string
}

interface AssignmentVersion extends AnyVersion {
  eventId: string
  workshopId: string | null
}

// ---- Event timeline types ----

type EventItemType = 'event' | 'workshops' | 'eventVolunteers' | 'eventVolunteerAssignments'

interface EventChildFields {
  _childWorkshopsUpdatedAt?: string
  _childEventVolunteersUpdatedAt?: string
  _childEventVolunteerAssignmentsUpdatedAt?: string
}

const eventChildFieldMap: Record<Exclude<EventItemType, 'event'>, keyof EventChildFields> = {
  workshops: '_childWorkshopsUpdatedAt',
  eventVolunteers: '_childEventVolunteersUpdatedAt',
  eventVolunteerAssignments: '_childEventVolunteerAssignmentsUpdatedAt',
}

type EventTimelineItem = {
  type: 'event'
  eventId: string
  eventVersionId: string
  data: AnyVersion
  updatedAt: number
} | {
  type: Exclude<EventItemType, 'event'>
  eventId: string
  updatedAt: number
}

interface EventVersionGroup extends EventChildFields {
  eventId: string
  eventVersionId?: string
  data: AnyVersion
  createdAt: number
  updatedAt: number
}

// ---- Workshop timeline types ----
interface WorkshopChildFields {
  _childEventVolunteerAssignmentsUpdatedAt?: string
}

type WorkshopTimelineItem = {
  type: 'workshop'
  workshopId: string
  workshopVersionId: string
  data: AnyVersion
  updatedAt: number
} | {
  type: 'eventVolunteerAssignments'
  workshopId: string
  updatedAt: number
}

interface WorkshopVersionGroup extends WorkshopChildFields {
  workshopId: string
  workshopVersionId?: string
  data: AnyVersion
  createdAt: number
  updatedAt: number
}

// ---- Migration ----

export const up: MigrationFn = async params => {
  const { context } = params

  const eventModel = context.getModel('events') as Nedb<AnyVersion>
  const workshopModel = context.getModel('workshops') as Nedb<AnyVersion>
  const eventVersionModel = context.getVersionModel('events') as Nedb<AnyVersion>
  const workshopVersionModel = context.getVersionModel('workshops') as Nedb<WorkshopVersion>
  const volunteerVersionModel = context.getVersionModel('eventVolunteers') as Nedb<VolunteerVersion>
  const assignmentVersionModel = context.getVersionModel('eventVolunteerAssignments') as Nedb<AssignmentVersion>

  const eventVersions = await eventVersionModel.findAsync({})
  const workshopVersions = await workshopVersionModel.findAsync({})
  const volunteerVersions = await volunteerVersionModel.findAsync({})
  const assignmentVersions = await assignmentVersionModel.findAsync({})

  // === Part 1: Event versions ===

  const eventItems: EventTimelineItem[] = [
    ...eventVersions.map(ev => ({
      type: 'event' as const,
      eventId: ev._recordId,
      eventVersionId: ev._id,
      data: ev,
      updatedAt: +new Date(ev._updatedAt),
    })),
    ...workshopVersions.map(wv => ({
      type: 'workshops' as const,
      eventId: wv.eventId,
      updatedAt: +new Date(wv._updatedAt),
    })),
    ...workshopVersions.filter(wv => wv._recordDeletedAt).map(wv => ({
      type: 'workshops' as const,
      eventId: wv.eventId,
      updatedAt: +new Date(wv._recordDeletedAt as string),
    })),
    ...volunteerVersions.map(vv => ({
      type: 'eventVolunteers' as const,
      eventId: vv.eventId,
      updatedAt: +new Date(vv._updatedAt),
    })),
    ...volunteerVersions.filter(vv => vv._recordDeletedAt).map(vv => ({
      type: 'eventVolunteers' as const,
      eventId: vv.eventId,
      updatedAt: +new Date(vv._recordDeletedAt as string),
    })),
    ...assignmentVersions.map(av => ({
      type: 'eventVolunteerAssignments' as const,
      eventId: av.eventId,
      updatedAt: +new Date(av._updatedAt),
    })),
    ...assignmentVersions.filter(av => av._recordDeletedAt).map(av => ({
      type: 'eventVolunteerAssignments' as const,
      eventId: av.eventId,
      updatedAt: +new Date(av._recordDeletedAt as string),
    })),
  ]

  const eventTimelines = Map.groupBy(
    sortBy(eventItems, ['updatedAt', 'type']),
    item => item.eventId,
  )

  for (const [eventId, items] of eventTimelines) {
    const groups = groupEventItems(items)
    for (const group of groups) {
      const childFields: EventChildFields = {
        _childWorkshopsUpdatedAt: group._childWorkshopsUpdatedAt,
        _childEventVolunteersUpdatedAt: group._childEventVolunteersUpdatedAt,
        _childEventVolunteerAssignmentsUpdatedAt: group._childEventVolunteerAssignmentsUpdatedAt,
      }
      const _updatedAt = new Date(group.updatedAt).toISOString()
      if (group.eventVersionId) {
        await eventVersionModel.updateAsync(
          { _id: group.eventVersionId },
          { ...group.data, ...childFields, _updatedAt },
        )
      } else {
        const { _id, ...rest } = group.data
        await eventVersionModel.insertAsync({ ...rest, ...childFields, _updatedAt } as unknown as AnyVersion)
      }
    }
    const lastGroup = groups.at(-1)
    if (lastGroup) {
      await eventModel.updateAsync({ _id: eventId }, {
        $set: {
          _childWorkshopsUpdatedAt: lastGroup._childWorkshopsUpdatedAt,
          _childEventVolunteersUpdatedAt: lastGroup._childEventVolunteersUpdatedAt,
          _childEventVolunteerAssignmentsUpdatedAt: lastGroup._childEventVolunteerAssignmentsUpdatedAt,
        },
      })
    }
  }

  // === Part 2: Workshop versions ===

  const workshopItems: WorkshopTimelineItem[] = [
    ...workshopVersions.map(wv => ({
      type: 'workshop' as const,
      workshopId: wv._recordId,
      workshopVersionId: wv._id,
      data: wv,
      updatedAt: +new Date(wv._updatedAt),
    })),
    ...assignmentVersions.filter(av => av.workshopId != null).map(av => ({
      type: 'eventVolunteerAssignments' as const,
      workshopId: av.workshopId as string,
      updatedAt: +new Date(av._updatedAt),
    })),
    ...assignmentVersions.filter(av => av.workshopId != null && av._recordDeletedAt).map(av => ({
      type: 'eventVolunteerAssignments' as const,
      workshopId: av.workshopId as string,
      updatedAt: +new Date(av._recordDeletedAt as string),
    })),
  ]

  const workshopTimelines = Map.groupBy(
    sortBy(workshopItems, ['updatedAt', 'type']),
    item => item.workshopId,
  )

  for (const [workshopId, items] of workshopTimelines) {
    const groups = groupWorkshopItems(items)
    for (const group of groups) {
      const childFields: WorkshopChildFields = {
        _childEventVolunteerAssignmentsUpdatedAt: group._childEventVolunteerAssignmentsUpdatedAt,
      }
      const _updatedAt = new Date(group.updatedAt).toISOString()
      if (group.workshopVersionId) {
        await workshopVersionModel.updateAsync(
          { _id: group.workshopVersionId },
          { ...group.data, ...childFields, _updatedAt },
        )
      } else {
        const { _id, ...rest } = group.data
        await workshopVersionModel.insertAsync({ ...rest, ...childFields, _updatedAt } as unknown as WorkshopVersion)
      }
    }
    const lastGroup = groups.at(-1)
    if (lastGroup) {
      await workshopModel.updateAsync({ _id: workshopId }, {
        $set: {
          _childEventVolunteerAssignmentsUpdatedAt: lastGroup._childEventVolunteerAssignmentsUpdatedAt,
        },
      })
    }
  }

  // === Part 3: Renumber _versionNumber to be sequential after new records were inserted ===

  await renumberVersions(eventVersionModel, eventModel)
  await renumberVersions(workshopVersionModel, workshopModel)
}

async function renumberVersions(
  versionModel: Nedb<AnyVersion>,
  currentModel: Nedb<AnyVersion>,
) {
  const allVersions = await versionModel.findAsync({})
  const byRecord = Map.groupBy(allVersions, v => v._recordId)

  for (const [recordId, versions] of byRecord) {
    const sorted = sortBy(versions, ['_updatedAt'])
    let changed = false
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i]._versionNumber !== i) {
        await versionModel.updateAsync({ _id: sorted[i]._id }, { $set: { _versionNumber: i } })
        changed = true
      }
    }
    if (changed) {
      const finalVersionNumber = sorted.length - 1
      await currentModel.updateAsync({ _id: recordId }, { $set: { _versionNumber: finalVersionNumber } })
    }
  }
}

export const down: MigrationFn = async () => {}

// ---- Event grouping ----

function groupEventItems(items: EventTimelineItem[]): EventVersionGroup[] {
  const groups: EventVersionGroup[] = []
  const firstEvent = items.find((i): i is EventTimelineItem & { type: 'event' } => i.type === 'event')
  if (!firstEvent) return []

  let current = newEventGroup(items[0], firstEvent.data)

  for (const item of items) {
    const createNewVersion =
      item.updatedAt > current.updatedAt + CREATE_VERSION_AFTER_IDLE_TIME
      || item.updatedAt > current.createdAt + MAX_VERSION_AGE
    if (createNewVersion || (current.eventVersionId !== undefined && item.type === 'event')) {
      groups.push(current)
      const data = item.type === 'event' ? item.data : current.data
      current = newEventGroup(item, data, current)
    }
    if (item.type === 'event') {
      current.eventVersionId = item.eventVersionId
      current.data = item.data
    } else {
      current[eventChildFieldMap[item.type]] = new Date(item.updatedAt).toISOString()
    }
  }
  groups.push(current)
  return groups
}

function newEventGroup(
  item: EventTimelineItem,
  data: AnyVersion,
  previous?: EventChildFields,
): EventVersionGroup {
  return {
    eventId: item.eventId,
    createdAt: item.updatedAt,
    updatedAt: item.updatedAt,
    data,
    _childWorkshopsUpdatedAt: previous?._childWorkshopsUpdatedAt,
    _childEventVolunteersUpdatedAt: previous?._childEventVolunteersUpdatedAt,
    _childEventVolunteerAssignmentsUpdatedAt: previous?._childEventVolunteerAssignmentsUpdatedAt,
  }
}

// ---- Workshop grouping ----

function groupWorkshopItems(items: WorkshopTimelineItem[]): WorkshopVersionGroup[] {
  const groups: WorkshopVersionGroup[] = []
  const firstWorkshop = items.find((i): i is WorkshopTimelineItem & { type: 'workshop' } => i.type === 'workshop')
  if (!firstWorkshop) return []

  let current = newWorkshopGroup(items[0], firstWorkshop.data)

  for (const item of items) {
    const createNewVersion =
      item.updatedAt > current.updatedAt + CREATE_VERSION_AFTER_IDLE_TIME
      || item.updatedAt > current.createdAt + MAX_VERSION_AGE
    if (createNewVersion || (current.workshopVersionId !== undefined && item.type === 'workshop')) {
      groups.push(current)
      const data = item.type === 'workshop' ? item.data : current.data
      current = newWorkshopGroup(item, data, current)
    }
    if (item.type === 'workshop') {
      current.workshopVersionId = item.workshopVersionId
      current.data = item.data
    } else {
      current._childEventVolunteerAssignmentsUpdatedAt = new Date(item.updatedAt).toISOString()
    }
  }
  groups.push(current)
  return groups
}

function newWorkshopGroup(
  item: WorkshopTimelineItem,
  data: AnyVersion,
  previous?: WorkshopChildFields,
): WorkshopVersionGroup {
  return {
    workshopId: item.workshopId,
    createdAt: item.updatedAt,
    updatedAt: item.updatedAt,
    data,
    _childEventVolunteerAssignmentsUpdatedAt: previous?._childEventVolunteerAssignmentsUpdatedAt,
  }
}
