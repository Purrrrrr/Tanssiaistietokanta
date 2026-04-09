import { randomUUID } from 'node:crypto'

import { sortBy } from 'es-toolkit'
import Nedb from '@seald-io/nedb'

import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'
import { omit } from 'ramda'

interface WorkshopVersion {
  _id: string
  _recordId: string
  _updatedAt: string
  _createdAt: string
  _versionCreatedAt: string
  _versionNumber: number
  eventId: string
  teacherIds?: string[]
  assistantTeacherIds?: string[]
  _recordDeletedAt?: string
}

interface AssignmentRecord {
  _id: string
  _versionNumber: number
  _versionId: string
  _updatedAt: string
  _createdAt: string
  eventId: string
  workshopId: string | null
  roleId: string
  volunteerId: string
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
  roleId: string
  volunteerId: string
  _recordDeletedAt?: string
}

export const up: MigrationFn = async params => {
  const { context } = params
  const eventRolesService = context.getService('eventRoles') as any

  // Look up roles by type
  const allRoles = await eventRolesService.find({ [SkipAccessControl]: true })
  const teacherRole = allRoles.find((r: any) => r.type === 'TEACHER')
  const assistantTeacherRole = allRoles.find((r: any) => r.type === 'OTHER' && r.appliesToWorkshops === true)

  if (!teacherRole) throw new Error('Teacher role (type: TEACHER) not found in eventRoles')
  if (!assistantTeacherRole) throw new Error('Assistant teacher role (type: OTHER, appliesToWorkshops: true) not found in eventRoles')

  const workshopVersionModel = context.getVersionModel('workshops') as Nedb<WorkshopVersion>
  const assignmentsModel = context.getModel('eventVolunteerAssignments') as Nedb<AssignmentRecord>
  const assignmentsVersionModel = context.getVersionModel('eventVolunteerAssignments') as Nedb<AssignmentVersionRecord>

  // Get all workshop versions sorted chronologically
  const allWorkshopVersions = await workshopVersionModel.findAsync({}) as WorkshopVersion[]
  const versionsByWorkshop = Map.groupBy(
    sortBy(allWorkshopVersions, ['_updatedAt']),
    v => v._recordId,
  )

  for (const [workshopId, versions] of versionsByWorkshop.entries()) {
    // Map from "volunteerId:roleId" -> { assignmentId, versionDocId }
    const activeAssignments = new Map<string, { assignmentId: string, versionDocId: string }>()

    let prevTeacherKeys = new Set<string>()
    let prevAssistantKeys = new Set<string>()

    for (const version of versions) {
      const { eventId, teacherIds = [], assistantTeacherIds = [], _updatedAt, _recordDeletedAt } = version

      const teacherKeys = new Set(teacherIds.map(id => `${id}:${teacherRole._id}`))
      const assistantKeys = new Set(assistantTeacherIds.map(id => `${id}:${assistantTeacherRole._id}`))
      const currentKeys = new Set([...teacherKeys, ...assistantKeys])

      // Determine role for each key
      const keyToRoleAndVolunteer = (key: string) => {
        const colonIdx = key.lastIndexOf(':')
        return {
          volunteerId: key.slice(0, colonIdx),
          roleId: key.slice(colonIdx + 1),
        }
      }

      const prevKeys = new Set([...prevTeacherKeys, ...prevAssistantKeys])

      // Handle added assignments
      for (const key of currentKeys) {
        if (!prevKeys.has(key)) {
          const { volunteerId, roleId } = keyToRoleAndVolunteer(key)
          const assignmentId = randomUUID()
          const versionDocId = randomUUID()

          await assignmentsVersionModel.insertAsync({
            _id: versionDocId,
            _recordId: assignmentId,
            _versionNumber: 1,
            _versionCreatedAt: _updatedAt,
            _createdAt: _updatedAt,
            _updatedAt,
            eventId,
            workshopId,
            roleId,
            volunteerId,
          })
          activeAssignments.set(key, { assignmentId, versionDocId })
        }
      }

      // Handle removed assignments
      for (const key of prevKeys) {
        if (_recordDeletedAt || !currentKeys.has(key)) {
          const active = activeAssignments.get(key)
          if (active) {
            await assignmentsVersionModel.updateAsync(
              { _id: active.versionDocId },
              { $set: { _recordDeletedAt: _updatedAt } },
            )
            activeAssignments.delete(key)
          }
        }
      }

      prevTeacherKeys = teacherKeys
      prevAssistantKeys = assistantKeys
    }

    // Insert currently active assignments into the current model
    for (const [, { assignmentId, versionDocId }] of activeAssignments.entries()) {
      const versionRecord = await assignmentsVersionModel.findOneAsync({ _id: versionDocId }) as AssignmentVersionRecord
      if (!versionRecord) continue

      const { _recordId: _, _versionCreatedAt: __, ...rest } = versionRecord
      await assignmentsModel.insertAsync({
        ...rest,
        _id: assignmentId,
        _versionId: versionDocId,
      })
    }
  }

  context.updateDatabase('workshop', omit(['teacherIds', 'assistantTeacherIds']))
}

export const down: MigrationFn = async _params => {}
