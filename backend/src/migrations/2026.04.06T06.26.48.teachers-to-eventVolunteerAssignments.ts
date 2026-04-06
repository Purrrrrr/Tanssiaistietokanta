import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const { context } = params
  const eventRolesService = context.getService('eventRoles') as any
  const assignmentsService = context.getService('eventVolunteerAssignments') as any

  // Look up roles by type
  const allRoles = await eventRolesService.find({ [SkipAccessControl]: true })
  const teacherRole = allRoles.find((r: any) => r.type === 'TEACHER')
  const assistantTeacherRole = allRoles.find((r: any) => r.type === 'OTHER' && r.appliesToWorkshops === true)

  if (!teacherRole) throw new Error('Teacher role (type: TEACHER) not found in eventRoles')
  if (!assistantTeacherRole) throw new Error('Assistant teacher role (type: OTHER, appliesToWorkshops: true) not found in eventRoles')

  // Iterate all workshops
  const workshopsModel = context.getModel('workshops')
  const workshops: any[] = await workshopsModel.findAsync({})

  for (const workshop of workshops) {
    for (const volunteerId of (workshop.teacherIds ?? [])) {
      await assignmentsService.create({
        eventId: workshop.eventId,
        workshopId: workshop._id,
        roleId: teacherRole._id,
        volunteerId,
      }, { [SkipAccessControl]: true })
    }
    for (const volunteerId of (workshop.assistantTeacherIds ?? [])) {
      await assignmentsService.create({
        eventId: workshop.eventId,
        workshopId: workshop._id,
        roleId: assistantTeacherRole._id,
        volunteerId,
      }, { [SkipAccessControl]: true })
    }
  }
}

export const down: MigrationFn = async _params => {}
