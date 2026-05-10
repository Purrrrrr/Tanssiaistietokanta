import { randomUUID } from 'node:crypto'

import { sortBy } from 'es-toolkit'
import Nedb from '@seald-io/nedb'

import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'

interface VolunteerVersion {
  _id: string
  _recordId: string
  _updatedAt: string
  _createdAt: string
  _versionCreatedAt: string
  _versionNumber: number
  status?: string
  interestedIn?: string[]
  eventId: string
  volunteerId: string
  _recordDeletedAt?: string
}

interface VolunteerRecord {
  _id: string
  status: string
  interestedIn: string[]
  eventId: string
  volunteerId: string
}

interface AssignmentRecord {
  _id: string
  _versionNumber: number
  _versionId: string
  _updatedAt: string
  _createdAt: string
  eventId: string
  workshopId: string | null
  workshopInstanceIds: null
  roleId: string
  volunteerId: string
  eventVolunteerId: string
  registrationStatus: string
}

interface AssignmentVersionRecord {
  _id: string
  _recordId: string
  _versionNumber: number
  _versionCreatedAt: string
  _updatedAt: string
  _createdAt: string
  eventId: string
  workshopId: string | null
  workshopInstanceIds: null
  roleId: string
  volunteerId: string
  eventVolunteerId: string
  registrationStatus: string
  _recordDeletedAt?: string
}

export const up: MigrationFn = async params => {
  const { context } = params
  const eventRolesService = context.getService('eventRoles') as any

  const allRoles = await eventRolesService.find({ [SkipAccessControl]: true })
  const nonWorkshopRoleIds = new Set<string>(
    allRoles.filter((r: any) => !r.appliesToWorkshops).map((r: any) => r._id as string),
  )

  const volunteerModel = context.getModel('eventVolunteers') as Nedb<VolunteerRecord>
  const volunteerVersionModel = context.getVersionModel('eventVolunteers') as Nedb<VolunteerVersion>
  const assignmentsModel = context.getModel('eventVolunteerAssignments') as Nedb<AssignmentRecord>
  const assignmentsVersionModel = context.getVersionModel('eventVolunteerAssignments') as Nedb<AssignmentVersionRecord>

  // Find all currently Accepted volunteers
  const acceptedVolunteers = await volunteerModel.findAsync({ status: 'Accepted' }) as VolunteerRecord[]
  // Load all volunteer versions, group by _recordId
  const allVersions = await volunteerVersionModel.findAsync({}) as VolunteerVersion[]
  const versionsByVolunteer = Map.groupBy(
    sortBy(allVersions, ['_updatedAt']),
    v => v._recordId,
  )

  for (const volunteer of acceptedVolunteers) {
    const versions = versionsByVolunteer.get(volunteer._id) ?? []

    // Find when each roleId was first added to interestedIn
    const roleFirstSeen = new Map<string, string>() // roleId -> _updatedAt
    const seenRoles = new Set<string>()

    for (const version of versions) {
      const roles = version.interestedIn ?? []
      for (const roleId of roles) {
        if (!seenRoles.has(roleId)) {
          seenRoles.add(roleId)
          roleFirstSeen.set(roleId, version._updatedAt)
        }
      }
    }

    // For each non-workshop role currently in interestedIn, create an assignment
    for (const roleId of volunteer.interestedIn) {
      if (!nonWorkshopRoleIds.has(roleId)) continue

      // Check if assignment already exists
      const existing = await assignmentsModel.findOneAsync({
        eventVolunteerId: volunteer._id,
        roleId,
        workshopId: null,
      })
      if (existing) continue

      const timestamp = roleFirstSeen.get(roleId) ?? volunteer._id
      const assignmentId = randomUUID()
      const versionDocId = randomUUID()

      const versionRecord: AssignmentVersionRecord = {
        _id: versionDocId,
        _recordId: assignmentId,
        _versionNumber: 1,
        _versionCreatedAt: timestamp,
        _createdAt: timestamp,
        _updatedAt: timestamp,
        eventId: volunteer.eventId,
        workshopId: null,
        workshopInstanceIds: null,
        roleId,
        volunteerId: volunteer.volunteerId,
        eventVolunteerId: volunteer._id,
        registrationStatus: 'None',
      }
      await assignmentsVersionModel.insertAsync(versionRecord)

      const { _recordId: _, _versionCreatedAt: __, ...rest } = versionRecord
      await assignmentsModel.insertAsync({
        ...rest,
        _id: assignmentId,
        _versionId: versionDocId,
      })
    }
  }
}

export const down: MigrationFn = async _params => {}
